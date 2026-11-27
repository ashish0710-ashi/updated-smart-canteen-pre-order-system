import { useCallback, useMemo, useState } from 'react';
import { ListChecks } from 'lucide-react';
import type { CartLine, MenuItem, Order, PaymentMethod, ViewKey } from './types';
import { useCanteenStore } from './hooks/useCanteenStore';
import { Header } from './components/Header';
import { CustomerMenu } from './components/CustomerMenu';
import { CartDrawer } from './components/CartDrawer';
import { OrderTracker } from './components/OrderTracker';
import { KitchenView } from './components/KitchenView';
import { NowServing } from './components/NowServing';
import { AnalyticsView } from './components/AnalyticsView';
import { OrderSuccessModal } from './components/OrderSuccessModal';

export default function App() {
  const store = useCanteenStore();
  const [view, setView] = useState<ViewKey>('customer');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const addToCart = useCallback((id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === id);
      const item = store.menu.find((m) => m.id === id);
      const cap = item?.stockCount ?? 99;
      if (existing) {
        if (existing.qty >= cap) return prev;
        return prev.map((c) => (c.itemId === id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { itemId: id, qty: 1 }];
    });
  }, [store.menu]);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.itemId === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(
    (input: {
      customerName: string;
      lines: { item: MenuItem; qty: number }[];
      paymentMethod: PaymentMethod;
    }) => {
      const order = store.placeOrder(input);
      setLastOrder(order);
      setShowSuccess(true);
      setCartOpen(false);
      clearCart();
    },
    [store, clearCart]
  );

  const queuePulse = useMemo(
    () => ({
      waiting: store.orders.filter((o) => o.status === 'waiting').length,
      preparing: store.orders.filter((o) => o.status === 'preparing').length,
      ready: store.orders.filter((o) => o.status === 'ready').length,
    }),
    [store.orders]
  );

  const jumpToToken = useCallback(() => {
    setView('customer');
    const el = document.getElementById('tracker-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 text-ink">
      <Header
        view={view}
        onView={setView}
        onReset={store.resetDemoData}
        activeToken={store.activeToken}
        onJumpToToken={jumpToToken}
        queuePulse={queuePulse}
      />

      <main>
        {view === 'customer' && (
          <div>
            <CustomerMenu
              menu={store.menu}
              cart={cart}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onOpenCart={() => setCartOpen(true)}
            />
            <div id="tracker-anchor" className="mx-auto max-w-7xl px-4 pt-2 sm:px-6">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-saffron-500" />
                <h2 className="font-display text-lg font-extrabold text-ink">Live Order Tracker</h2>
              </div>
              <OrderTracker
                orders={store.orders}
                activeToken={store.activeToken}
                now={store.now}
                onDismissToken={() => store.setActiveTokenId(null)}
              />
            </div>
          </div>
        )}

        {view === 'kitchen' && (
          <KitchenView
            orders={store.orders}
            menu={store.menu}
            now={store.now}
            onAdvance={(id, status) => store.updateOrderStatus(id, status)}
            onComplete={(id) => store.completeOrder(id)}
            onToggleAvailable={store.setItemAvailable}
            onAdjustStock={store.adjustStock}
          />
        )}

        {view === 'serving' && <NowServing orders={store.orders} now={store.now} />}

        {view === 'analytics' && <AnalyticsView orders={store.orders} menu={store.menu} />}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        menu={store.menu}
        orders={store.orders}
        onInc={addToCart}
        onDec={removeFromCart}
        onClear={clearCart}
        onPlace={placeOrder}
      />

      <OrderSuccessModal
        order={showSuccess ? lastOrder : null}
        onClose={() => setShowSuccess(false)}
        onTrack={() => {
          setShowSuccess(false);
          const el = document.getElementById('tracker-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
    </div>
  );
}
