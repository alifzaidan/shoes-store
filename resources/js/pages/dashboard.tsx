import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/',
    },
];

export default function Dashboard({
    products,
}: {
    products: { id: number; title: string; category: { name: string }; price: number; image: string }[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex min-h-[50vh] flex-1 flex-col justify-center overflow-hidden rounded-xl border bg-[url(/images/hero.jpeg)] bg-cover pl-4 md:pl-24">
                    <h1 className="text-2xl font-semibold">Langkah Pasti, Gaya Tanpa Batas</h1>
                    <p className="mb-4 text-sm text-gray-500 md:w-2xl">
                        Temukan koleksi sepatu terbaik untuk setiap langkahmu. Dari sepatu dewasa hingga anak-anak, kami punya semua yang kamu
                        butuhkan.
                    </p>
                    <Button className="w-fit">Belanja Sekarang</Button>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-[url(/images/man-shoes.png)] bg-cover bg-center p-4">
                        <Badge variant="secondary">Sepatu Pria</Badge>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-[url(/images/woman-shoes.png)] bg-cover bg-bottom p-4">
                        <Badge variant="secondary">Sepatu Wanita</Badge>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-[url(/images/kids-shoes.png)] bg-cover bg-center p-4">
                        <Badge variant="secondary">Sepatu Anak-anak</Badge>
                    </div>
                </div>
                <h1 className="text-2xl font-semibold">Produk Kita</h1>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {products.map((product) => (
                        <div key={product.id} className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border p-4">
                            <img src={`/storage/${product.image}`} alt={product.title} className="rounded-lg" />
                            <h2 className="mt-2 text-lg font-semibold">{product.title}</h2>
                            <p className="text-sm text-gray-500">{product.category?.name}</p>
                            <p className="text-lg font-semibold">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }).format(product.price)}
                            </p>
                            <Button className="mt-2 w-full" asChild>
                                <Link href={route('product.detail', product.id)}>Lihat Produk</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
