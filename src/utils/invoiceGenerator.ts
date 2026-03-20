import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Order, Address, CartItem } from '../context/CartContext';

interface InvoiceData {
    order: Order;
    customerName: string;
    address?: Address;
    companyInfo: {
        name: string;
        address: string;
        email: string;
        phone: string;
    };
}

export const generateInvoice = async (data: InvoiceData) => {
    const { order, customerName, address, companyInfo } = data;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = '#1B5285'; // HELOMED primary color
    const tableHeaderBg = '#E8E8E8';
    const darkGray = '#333333';
    const mediumGray = '#666666';
    const lightGray = '#999999';
    
    let yPos = 20;
    
    // INVOICE Title (Left side)
    doc.setFontSize(28);
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, yPos);
    
    // Add HELOMED logo (Top right corner)
    try {
        const logoImg = new Image();
        logoImg.src = '/images/logo.png';
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            setTimeout(reject, 1000); // Timeout after 1s
        });
        doc.addImage(logoImg, 'PNG', pageWidth - 45, 12, 30, 30);
    } catch (error) {
        // If logo fails to load, continue without it
        console.warn('Logo could not be loaded for invoice');
    }
    
    // Invoice Details (Right side, aligned with logo)
    const detailsStartY = 48;
    doc.setFontSize(8);
    doc.setTextColor(lightGray);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE NO:', pageWidth - 65, detailsStartY);
    doc.text('DATE:', pageWidth - 65, detailsStartY + 5);
    doc.text('PAYMENT METHOD:', pageWidth - 65, detailsStartY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray);
    const orderNumber = order.order_number || order.id;
    const orderDate = new Date(order.created_at || order.date);
    const paymentMethodLabel = order.payment_mode === 2 ? 'Pay Online' : 'Pay on Delivery';
    
    doc.text(orderNumber.toString(), pageWidth - 15, detailsStartY, { align: 'right' });
    doc.text(orderDate.toLocaleDateString('en-GB'), pageWidth - 15, detailsStartY + 5, { align: 'right' });
    doc.text(paymentMethodLabel, pageWidth - 15, detailsStartY + 10, { align: 'right' });
    
    yPos = 55;
    
    // Issued To section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightGray);
    doc.text('ISSUED TO:', 20, yPos);
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray);
    doc.text(customerName, 20, yPos);
    
    if (address) {
        yPos += 4;
        doc.setFontSize(8);
        const addressText = address.text || address.full_address || '';
        const addressLines = doc.splitTextToSize(addressText, 100);
        doc.text(addressLines, 20, yPos);
        yPos += addressLines.length * 4;
    }
    
    yPos += 12;
    
    // Table - Line Items
    const tableData = order.items.map((item: CartItem) => [
        item.name,
        `Rs ${item.price.toFixed(2)}`,
        item.quantity.toString(),
        `Rs ${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    autoTable(doc, {
        startY: yPos,
        head: [['DESCRIPTION', 'RATE', 'QTY', 'TOTAL']],
        body: tableData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 8,
            textColor: darkGray,
            lineColor: '#DDDDDD',
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: tableHeaderBg,
            textColor: mediumGray,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 8,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
        },
        margin: { left: 20, right: 20 },
        alternateRowStyles: {
            fillColor: '#FAFAFA',
        },
    });
    
    // Get final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 10;
    
    // Calculate amounts
    const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.10; // 10% tax
    const taxAmount = order.taxes_and_fee || (subtotal * taxRate);
    const deliveryFee = order.delivery_fee || 0;
    const total = order.total;
    
    // Calculate actual tax percentage dynamically
    const actualTaxPercentage = subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(0) : '0';
    
    // Summary - Right aligned
    const summaryX = pageWidth - 20;
    const labelX = pageWidth - 65;
    
    doc.setFontSize(9);
    
    // Subtotal
    doc.setTextColor(mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.text('SUBTOTAL', labelX, yPos, { align: 'left' });
    doc.setTextColor(darkGray);
    doc.text(`Rs ${subtotal.toFixed(2)}`, summaryX, yPos, { align: 'right' });
    
    yPos += 6;
    
    // Tax
    if (taxAmount > 0) {
        doc.setTextColor(mediumGray);
        doc.text(`Tax ${actualTaxPercentage}%`, labelX, yPos, { align: 'left' });
        doc.setTextColor(darkGray);
        doc.text(`Rs ${taxAmount.toFixed(2)}`, summaryX, yPos, { align: 'right' });
        yPos += 6;
    }
    
    // Delivery Fee
    if (deliveryFee > 0) {
        doc.setTextColor(mediumGray);
        doc.text('Delivery Fee', labelX, yPos, { align: 'left' });
        doc.setTextColor(darkGray);
        doc.text(`Rs ${deliveryFee.toFixed(2)}`, summaryX, yPos, { align: 'right' });
        yPos += 6;
    }
    
    // Cash Handling (only for COD)
    if (order.payment_mode !== 2) {
        doc.setTextColor(mediumGray);
        doc.text('Cash Handling', labelX, yPos, { align: 'left' });
        doc.setTextColor(darkGray);
        doc.text('Rs 10.00', summaryX, yPos, { align: 'right' });
        yPos += 6;
    }
    
    yPos += 2;
    
    // Total
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mediumGray);
    doc.text('TOTAL', labelX, yPos, { align: 'left' });
    doc.setTextColor(primaryColor);
    doc.setFontSize(12);
    doc.text(`Rs ${total.toFixed(2)}`, summaryX, yPos, { align: 'right' });
    
    yPos += 18;
    
    // Payment Info Section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(lightGray);
    doc.text('PAYMENT INFO:', 20, yPos);
    
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray);
    doc.text(companyInfo.name, 20, yPos);
    
    // Footer - Company Info
    yPos = pageHeight - 18;
    doc.setFontSize(7);
    doc.setTextColor(mediumGray);
    doc.setFont('helvetica', 'normal');
    
    // Center-aligned footer
    doc.text(companyInfo.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 3;
    
    const addressLines = doc.splitTextToSize(companyInfo.address, pageWidth - 40);
    addressLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += 3;
    });
    
    doc.text(`Email: ${companyInfo.email} | Phone: ${companyInfo.phone}`, pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    const fileName = `HELOMED_Invoice_${orderNumber}_${orderDate.toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
};

// Helper to get payment mode label
export const getPaymentModeLabel = (mode?: number) => {
    if (mode === 2) return 'Pay Online';
    return 'Pay on Delivery';
};
