import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function DetailProduct({
    product,
}: {
    product: { id: number; title: string; category: { name: string }; description: string; price: number; image: string };
}) {
    return (
        <AppLayout>
            <Head title={product.title} />
            <div className="border-sidebar-border/70 dark:border-sidebar-border mx-auto mt-4 flex max-w-3xl flex-col gap-8 rounded-xl border p-8 md:flex-row">
                <img src={`/storage/${product.image}`} alt={product.title} className="h-80 w-80 rounded-xl object-cover" />
                <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold">{product.title}</h1>
                    <p className="mb-2 text-gray-500">{product.category?.name}</p>
                    <p className="mb-4">{product.description}</p>
                    <p className="mb-4 text-2xl font-semibold">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(product.price)}
                    </p>
                    <form method="post" action="/keranjang/tambah">
                        <input type="hidden" name="product_id" value={product.id} />
                        <input
                            type="number"
                            name="qty"
                            min={1}
                            defaultValue={1}
                            className="mr-2 w-16 appearance-none rounded border px-1 py-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <Button type="submit">Tambah ke Keranjang</Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
