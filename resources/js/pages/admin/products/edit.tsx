'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { parseRupiah, rupiahFormatter } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Product } from './columns';

const formSchema = z.object({
    image: z.any(),
    title: z.string().min(1, {
        message: 'Nama produk tidak boleh kosong',
    }),
    description: z.string().min(1, {
        message: 'Deskripsi produk tidak boleh kosong',
    }),
    price: z.number().min(0),
    stock: z.number().min(0),
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin',
    },
    {
        title: 'Produk',
        href: '/admin/products',
    },
    {
        title: 'Edit Produk',
        href: '/admin/products/edit',
    },
];

export default function EditProduct({ product }: { product: Product }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            image: null,
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('price', values.price.toString());
        formData.append('stock', values.stock.toString());

        if (values.image) {
            formData.append('image', values.image);
        }
        formData.append('_method', 'put');

        router.post(route('products.update', { id: product.id }), formData, {
            forceFormData: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Product" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4 md:p-8">
                    <h1 className="mb-8 text-2xl font-semibold">Edit Produk</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gambar Produk</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        field.onChange(file);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Produk</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nama Produk" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Deskripsi Produk</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Deskripsi Produk" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga Produk</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Harga Produk"
                                                {...field}
                                                value={rupiahFormatter.format(field.value || 0)}
                                                onChange={(e) => field.onChange(parseRupiah(e.target.value))}
                                                autoComplete="off"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stok Produk</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Stok Produk"
                                                {...field}
                                                value={field.value}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
