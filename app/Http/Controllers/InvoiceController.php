<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Invoice;
use App\Models\InvoiceProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Haruncpi\LaravelIdGenerator\IdGenerator;

use Xendit\Configuration;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Invoice\InvoiceApi;

class InvoiceController extends Controller
{
    public function __construct()
    {
        Configuration::setXenditKey(config('xendit.API_KEY'));
    }

    public function index()
    {
        $userId = Auth::id();
        $invoices = Invoice::with('items', 'items.product')->where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return Inertia::render('invoice', compact('invoices'));
    }

    public function store()
    {
        DB::beginTransaction();
        try {
            $userId =  Auth::id();
            $carts = Cart::with('product')->where([['user_id', $userId], ['status', 'active']])->get();
            $items = array();
            $amount = 0;
            foreach ($carts as $cart) {
                $items[] = [
                    'name' => $cart->product->title,
                    'price' => $cart->product->price,
                    'quantity' => $cart->quantity,
                ];
                $amount += $cart->product->price * $cart->quantity;
            }
            // dd($items);
            $invoice_code = IdGenerator::generate(['table' => 'invoices', 'field' => 'invoice_code', 'length' => 11, 'reset_on_prefix_change'  => true, 'prefix' => 'INV-' . date('y')]);
            $invoice = Invoice::create([
                'user_id' => $userId,
                'invoice_code' => $invoice_code,
                'amount' => $amount,
            ]);

            //request create invoice
            $xendit_create_invoice = new CreateInvoiceRequest([
                'external_id' => $invoice_code,
                'customer' => [
                    'given_names' => Auth::user()->name,
                    'email' => Auth::user()->email,
                ],
                'amount' => $amount,
                'items' => $items,
                'failure_redirect_url' => route('invoice.showDetail', ['id' => $invoice->id]),
                'success_redirect_url' => route('invoice.showDetail', ['id' => $invoice->id]),
            ]);

            //instance api xendit
            $xendit_api_instance = new InvoiceApi();
            //create xendit invoice
            $xendit_invoice = $xendit_api_instance->createInvoice($xendit_create_invoice);

            $invoice->update([
                'invoice_url' => $xendit_invoice['invoice_url'],
            ]);

            foreach ($carts as $cart) {
                $cart->update([
                    'status' => 'ordered',
                ]);

                $cart->product->update([
                    'stock' => $cart->product->stock - $cart->quantity,
                ]);

                InvoiceProduct::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $cart->product_id,
                    'price' => $cart->product->price,
                    'quantity' => $cart->quantity,
                ]);
            }
            DB::commit();

            return response()->json([
                'url' => $xendit_invoice['invoice_url'],
            ], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function show($id)
    {
        $invoice = Invoice::with('items', 'items.product')->findOrFail($id);
        return Inertia::render('invoice-detail', compact('invoice'));
    }

    public function callbackXendit(Request $request)
    {
        $getToken = $request->header('x-callback-token');
        $callbackToken = config('xendit.CALLBACK_TOKEN');

        if ($getToken != $callbackToken) {
            return response()->json(['message' => 'unauthorized'], 401);
        }

        //cek eksternal id darri xendit dengan external id di database
        $invoice = Invoice::where('invoice_code', $request->external_id)->first();
        if (!$invoice) {
            return response()->json(['message' => 'Invoice Not Found'], 404);
        }
        $date = date_create($request->paid_at);
        $paid_at = date_format($date, "Y-m-d H:i:s");
        $invoice->update([
            'paid_at' => $paid_at,
            'status' => ($request->status == 'PAID' || $request->status == 'SETTLED') ? 'paid' : 'failed',
            'payment_method' => $request->payment_method,
            'payment_channel' => $request->payment_channel
        ]);

        return response()->json(['message' => 'Success'], 200);
    }
}
