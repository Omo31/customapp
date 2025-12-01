
'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { type Order, type PurchaseOrder } from '@/types';
import { format } from 'date-fns';

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const generatePdf = (title: string, fileName: string, head: any[], body: any[], finalY: number, summary: any[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Add Header
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text('BeautifulSoup&Foods', 14, 30);

  // Add Table
  doc.autoTable({
    startY: 50,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  });
  
  // Add Summary
  const finalYPos = (doc as any).lastAutoTable.finalY || finalY;
  doc.autoTable({
    startY: finalYPos + 10,
    body: summary,
    theme: 'plain',
    styles: {
      halign: 'right',
    },
    columnStyles: {
        0: { fontStyle: 'bold', halign: 'right' },
    }
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
};

export const generateOrderPdf = (order: Order) => {
    if (!order) return;

    const head = [['Item', 'Quantity', 'Unit Cost', 'Subtotal']];
    const body = order.items.map(item => [
        item.name,
        `${item.quantity} ${item.unit === 'Custom' ? item.customUnit : item.unit}`,
        `₦${item.unitCost?.toLocaleString() || 'N/A'}`,
        `₦${((item.unitCost || 0) * Number(item.quantity)).toLocaleString()}`
    ]);
    const summary = [
        ['Total Paid:', `₦${order.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
    ];
    
    const docInfo = {
        title: `Receipt for Order #${order.id?.slice(-6)}`,
        customer: order.customerName,
        date: format(new Date(order.createdAt.seconds * 1000), 'PPP')
    };

    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Header
    doc.setFontSize(22);
    doc.text('Receipt', 14, 22);
    doc.setFontSize(12);
    doc.text(`Order: #${order.id?.slice(-6)}`, 14, 30);
    doc.text(`Date: ${docInfo.date}`, 14, 36);

    // Company & Customer Info
    doc.text('From:', 14, 46);
    doc.setFontSize(10);
    doc.text('BeautifulSoup&Foods', 14, 52);
    doc.text('Lagos, Nigeria', 14, 57);

    doc.setFontSize(12);
    doc.text('To:', 120, 46);
    doc.setFontSize(10);
    doc.text(order.customerName, 120, 52);
    doc.text(order.shippingAddress || 'N/A', 120, 57);

    // Table
    doc.autoTable({
        startY: 70,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
    });

    // Summary
    const finalYPos = (doc as any).lastAutoTable.finalY || 100;
     doc.autoTable({
        startY: finalYPos + 10,
        body: summary,
        theme: 'plain',
        tableWidth: 'wrap',
        margin: { left: 120 },
        styles: {
            cellPadding: 2,
            fontSize: 12,
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
        }
    });

    doc.save(`receipt-order-${order.id?.slice(-6)}.pdf`);
};

export const generatePurchaseOrderPdf = (po: PurchaseOrder) => {
    if (!po) return;

    const head = [['Description', 'Quantity', 'Unit Cost', 'Total']];
    const body = po.items.map(item => [
        item.description,
        item.quantity,
        `₦${item.unitCost.toLocaleString()}`,
        `₦${item.total.toLocaleString()}`
    ]);
    const summary = [
        ['Subtotal:', `₦${po.subtotal.toLocaleString()}`],
        ['Shipping:', `₦${po.shipping.toLocaleString()}`],
        ['Total:', `₦${po.total.toLocaleString()}`]
    ];
    
    const docInfo = {
        title: `Purchase Order #${po.poNumber}`,
        date: po.issueDate?.seconds ? format(new Date(po.issueDate.seconds * 1000), 'PPP') : 'N/A',
        deliveryDate: po.deliveryDate?.seconds ? format(new Date(po.deliveryDate.seconds * 1000), 'PPP') : 'N/A'
    };

    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Header
    doc.setFontSize(22);
    doc.text('Purchase Order', 14, 22);
    doc.setFontSize(12);
    doc.text(`PO Number: #${po.poNumber}`, 14, 30);
    doc.text(`Date Issued: ${docInfo.date}`, 14, 36);

    // Company & Supplier Info
    doc.text('From:', 14, 46);
    doc.setFontSize(10);
    doc.text('BeautifulSoup&Foods', 14, 52);
    doc.text('Lagos, Nigeria', 14, 57);

    doc.setFontSize(12);
    doc.text('To (Supplier):', 120, 46);
    doc.setFontSize(10);
    doc.text(po.supplier.name, 120, 52);
    doc.text(po.supplier.address, 120, 57);
    doc.text(po.supplier.email, 120, 62);

    // Table
    doc.autoTable({
        startY: 70,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
    });
    
    // Summary
    const finalYPos = (doc as any).lastAutoTable.finalY || 100;
     doc.autoTable({
        startY: finalYPos + 10,
        body: summary,
        theme: 'plain',
        tableWidth: 'wrap',
        margin: { left: 120 },
        styles: {
            cellPadding: 2,
            fontSize: 10,
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
        }
    });

    doc.save(`po-${po.poNumber}.pdf`);
};

