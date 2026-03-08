import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Upload, Shield, Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

const categoryLabels: Record<string, string> = {
  "big-paintings": "Big Paintings",
  "medium-paintings": "Medium Paintings",
  "hanging-lamps": "Hanging Lamps",
};

const emptyProduct = {
  slug: "",
  name: "",
  description: "",
  long_description: "",
  price: 0,
  category: "medium-paintings" as const,
  inventory_tag: "in-stock" as const,
  image_day: "",
  image_night: "",
  dimensions: "",
  material: "",
  featured: false,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof emptyProduct & { id?: string }>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploadingDay, setUploadingDay] = useState(false);
  const [uploadingNight, setUploadingNight] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("products");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (isAdmin && activeTab === "orders") fetchOrders();
  }, [isAdmin, activeTab]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as any })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order status updated" });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdatingOrderId(null);
  };

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="font-serif text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const uploadImage = async (file: File, type: "day" | "night") => {
    const setter = type === "day" ? setUploadingDay : setUploadingNight;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditingProduct((prev) => ({
        ...prev,
        [type === "day" ? "image_day" : "image_night"]: publicUrl,
      }));
      toast({ title: `${type === "day" ? "Day" : "Night"} image uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleSave = async () => {
    if (!editingProduct.name || !editingProduct.slug || !editingProduct.image_day) {
      toast({ title: "Missing fields", description: "Name, slug, and day image are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: editingProduct.slug,
        name: editingProduct.name,
        description: editingProduct.description,
        long_description: editingProduct.long_description,
        price: editingProduct.price,
        category: editingProduct.category,
        inventory_tag: editingProduct.inventory_tag,
        image_day: editingProduct.image_day,
        image_night: editingProduct.image_night || null,
        dimensions: editingProduct.dimensions || null,
        material: editingProduct.material,
        featured: editingProduct.featured,
      };

      if (editingProduct.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Product updated" });
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast({ title: "Product created" });
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setEditingProduct(emptyProduct);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  const openEdit = (p: DbProduct) => {
    setEditingProduct({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      long_description: p.long_description,
      price: p.price,
      category: p.category as typeof emptyProduct.category,
      inventory_tag: p.inventory_tag as typeof emptyProduct.inventory_tag,
      image_day: p.image_day,
      image_night: p.image_night || "",
      dimensions: p.dimensions || "",
      material: p.material,
      featured: p.featured,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingProduct(emptyProduct);
    setDialogOpen(true);
  };

  const filtered = filterCategory === "all"
    ? products
    : products?.filter((p) => p.category === filterCategory);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="mt-1 text-muted-foreground">Manage products, orders, and more</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" /> Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6 flex items-center justify-between">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingProduct.id ? "Edit Product" : "New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={editingProduct.name} onChange={(e) => setEditingProduct((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input id="slug" value={editingProduct.slug} onChange={(e) => setEditingProduct((p) => ({ ...p, slug: e.target.value }))} placeholder="unique-product-id" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea id="description" rows={2} value={editingProduct.description} onChange={(e) => setEditingProduct((p) => ({ ...p, description: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDesc">Long Description</Label>
                    <Textarea id="longDesc" rows={4} value={editingProduct.long_description} onChange={(e) => setEditingProduct((p) => ({ ...p, long_description: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" type="number" value={editingProduct.price} onChange={(e) => setEditingProduct((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editingProduct.category} onValueChange={(v: any) => setEditingProduct((p) => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="big-paintings">Big Paintings</SelectItem>
                          <SelectItem value="medium-paintings">Medium Paintings</SelectItem>
                          <SelectItem value="hanging-lamps">Hanging Lamps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Inventory</Label>
                      <Select value={editingProduct.inventory_tag} onValueChange={(v: any) => setEditingProduct((p) => ({ ...p, inventory_tag: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-stock">In Stock</SelectItem>
                          <SelectItem value="made-to-order">Made to Order</SelectItem>
                          <SelectItem value="limited-edition">Limited Edition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input id="dimensions" value={editingProduct.dimensions} onChange={(e) => setEditingProduct((p) => ({ ...p, dimensions: e.target.value }))} placeholder='e.g. 35" × 25"' />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input id="material" value={editingProduct.material} onChange={(e) => setEditingProduct((p) => ({ ...p, material: e.target.value }))} />
                    </div>
                  </div>

                  {/* Image uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Day Image *</Label>
                      {editingProduct.image_day && (
                        <img src={editingProduct.image_day} alt="Day" className="h-32 w-full rounded-md border object-contain bg-muted" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL"
                          value={editingProduct.image_day}
                          onChange={(e) => setEditingProduct((p) => ({ ...p, image_day: e.target.value }))}
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "day")}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingDay} asChild>
                            <span>{uploadingDay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Night Image</Label>
                      {editingProduct.image_night && (
                        <img src={editingProduct.image_night} alt="Night" className="h-32 w-full rounded-md border object-contain bg-foreground" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL (optional)"
                          value={editingProduct.image_night}
                          onChange={(e) => setEditingProduct((p) => ({ ...p, image_night: e.target.value }))}
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "night")}
                          />
                          <Button type="button" variant="outline" size="icon" disabled={uploadingNight} asChild>
                            <span>{uploadingNight ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingProduct.featured}
                      onCheckedChange={(v) => setEditingProduct((p) => ({ ...p, featured: v }))}
                    />
                    <Label>Featured Product</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingProduct.id ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{products?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{products?.filter((p) => p.featured).length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{new Set(products?.map((p) => p.category)).size || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Filter:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="big-paintings">Big Paintings</SelectItem>
                <SelectItem value="medium-paintings">Medium Paintings</SelectItem>
                <SelectItem value="hanging-lamps">Hanging Lamps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img src={product.image_day} alt="" className="h-12 w-12 rounded object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabels[product.category]}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.inventory_tag === "in-stock" ? "outline" : product.inventory_tag === "limited-edition" ? "default" : "secondary"}>
                          {product.inventory_tag}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.featured ? "⭐" : "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No products found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {/* Order Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{orders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{orders.filter((o) => o.status === "pending").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{orders.filter((o) => o.status === "confirmed").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{orders.filter((o) => o.status === "delivered").length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Filter */}
          <div className="mb-4 flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Filter:</Label>
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="ml-auto">
              Refresh
            </Button>
          </div>

          {/* Orders Table */}
          {ordersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.shipping_name}</p>
                          <p className="text-muted-foreground">{order.shipping_phone}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping_city}, {order.shipping_state}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2 text-xs">
                              <img src={item.product_image} alt="" className="h-8 w-8 rounded object-cover" />
                              <span>{item.product_name} × {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                          order.status === "cancelled" ? "destructive" :
                          order.status === "shipped" ? "secondary" :
                          "outline"
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateOrderStatus(order.id, v)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-32">
                            {updatingOrderId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No orders found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
