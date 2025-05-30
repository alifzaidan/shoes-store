import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

const invoice = {
    id: 1,
    created_at: '2025-05-30 10:00:00',
    total: 300000,
    status: 'selesai',
    alamat: 'Jl. Contoh No. 123, Jakarta',
    items: [
        {
            id: 1,
            product: { title: 'Sepatu Keren', image: 'contoh-sepatu.jpg' },
            qty: 1,
            price: 200000,
        },
        {
            id: 2,
            product: { title: 'Sandal Santai', image: 'contoh-sandal.jpg' },
            qty: 2,
            price: 50000,
        },
    ],
};

export default function InvoiceDetail() {
    return (
        <AppLayout>
            <Head title={`Invoice #${invoice.id}`} />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Detail Invoice #{invoice.id}</h1>
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">{new Date(invoice.created_at).toLocaleString('id-ID')}</div>
                    <Badge>{invoice.status}</Badge>
                </div>
                <div className="mb-4">
                    <div className="font-semibold">Alamat Pengiriman</div>
                    <div className="text-sm">{invoice.alamat}</div>
                </div>
                <div className="rounded-xl border p-4 shadow-sm">
                    <div className="divide-y">
                        {invoice.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2">
                                <img
                                    src={`/storage/${item.product.image}`}
                                    alt={item.product.title}
                                    className="h-12 w-12 rounded border object-cover"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{item.product.title}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {item.qty} x Rp{item.price.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">Rp{(item.qty * item.price).toLocaleString('id-ID')}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between font-semibold">
                        <span>Total</span>
                        <span>Rp{invoice.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                <Button className="mt-6" variant={'outline'} asChild>
                    <Link href={route('invoice.show')}>Kembali ke Riwayat</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
