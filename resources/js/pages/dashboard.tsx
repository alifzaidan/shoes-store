import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
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
                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border p-4">
                        <img src="/images/nike-shox-tl.jpg" alt="Adidas Samba" className="rounded-lg" />
                        <h2 className="mt-2 text-lg font-semibold">Nike Shox TL</h2>
                        <p className="text-sm text-gray-500">Sepatu Pria</p>
                        <p className="text-lg font-semibold">Rp 2.600.000</p>
                        <Button className="mt-2 w-full">Lihat Produk</Button>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border p-4">
                        <img src="/images/nike-air-force-1.jpg" alt="Adidas Samba" className="rounded-lg" />
                        <h2 className="mt-2 text-lg font-semibold">Nike Air Force 1</h2>
                        <p className="text-sm text-gray-500">Sepatu Wanita</p>
                        <p className="text-lg font-semibold">Rp 1.500.000</p>
                        <Button className="mt-2 w-full">Lihat Produk</Button>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border p-4">
                        <img src="/images/nike-air-max-systm.jpg" alt="Adidas Samba" className="rounded-lg" />
                        <h2 className="mt-2 text-lg font-semibold">Nike Air Max SYSTM</h2>
                        <p className="text-sm text-gray-500">Sepatu Anak-anak</p>
                        <p className="text-lg font-semibold">Rp 800.000</p>
                        <Button className="mt-2 w-full">Lihat Produk</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
