import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WhatsAppChatDrawer from '../components/chat/WhatsAppChatDrawer';

export default function MainLayout({ user = null, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Global WhatsApp Chat Drawer */}
      <WhatsAppChatDrawer />
    </div>
  );
}
