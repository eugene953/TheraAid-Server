import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
  auctionId: string;
  userName: string;
  auctionTitle: string;
  highestBid: string;
  endDate: string;
  phoneNumber: string;
  sellerUserName: string;
  sellerPhoneNumber: string;
}

export const generatePdfReport = (
  winners: ReportData[],
  reportDate: Date,
  period: string,
  adminName: string
): ArrayBuffer => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'normal');

  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102); // Blue color for title
  doc.text('KAKO ONLINE AUCTION SYSTEM', 105, 15, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.text('AUCTIONS ENDED - WINNERS REPORT', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50); // Default text color
  const today: string = new Date().toISOString().split('T')[0];
  doc.text(`GENERATED ON: ${today}`, 105, 35, { align: 'center' });
  doc.text(`Report Date: ${reportDate.toLocaleDateString()}`, 10, 45);
  doc.text(`Report Period: ${period}`, 10, 52);

  doc.setLineWidth(0.5);
  doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

  const headers: string[][] = [
    [
      'Auction ID',
      'Product Name',
      'Seller',
      'Winner',
      'Winning Bid (XAF)',
      'End Date',
      'Seller Tel. Number',
      'Winner Tel. Number',
    ],
  ];

  const tableData: string[][] = winners.map((winner) => [
    winner.auctionId || 'N/A',
    winner.auctionTitle || 'N/A',
    winner.sellerUserName || 'N/A',
    winner.userName || 'N/A',
    winner.highestBid || '0',
    winner.endDate || 'N/A',
    winner.sellerPhoneNumber || 'N/A',
    winner.phoneNumber || 'N/A',
  ]);

  // Calculate the A4 document width (210mm) minus margins for the table
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = pageWidth - 2 * margin;

  // Generate Table with enhanced styling
  autoTable(doc, {
    startY: 60,
    head: headers,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 102], // Dark Blue Header
      textColor: [255, 255, 255], // White Text
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 5,
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [50, 50, 50],
      valign: 'middle',
      lineColor: [200, 200, 200],
      lineWidth: 0.15,
      minCellHeight: 8,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240], // Light gray for alternate rows
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.1 }, // Auction ID
      1: { cellWidth: tableWidth * 0.15 }, // Product Name
      2: { cellWidth: tableWidth * 0.13 }, // Seller
      3: { cellWidth: tableWidth * 0.13 }, // Winner
      4: { cellWidth: tableWidth * 0.13 }, // Winning Bid (XAF)
      5: { cellWidth: tableWidth * 0.12 }, // End Date
      6: { cellWidth: tableWidth * 0.12 }, // Seller Tel. Number
      7: { cellWidth: tableWidth * 0.12 }, // Winner Tel. Number
    },
    margin: { top: 60, left: margin, right: margin },
  });

  const footerStartY = doc.internal.pageSize.height - 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('PREPARED BY:', 30, footerStartY);
  doc.text('APPROVED BY:', 130, footerStartY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text('Admin Name', 30, footerStartY + 10);
  doc.text(adminName, 60, footerStartY);
  doc.text('Manager Name', 130, footerStartY + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('Kako Auction System', 104, footerStartY + 22, { align: 'center' });
  doc.text(
    'CONFIDENTIAL REPORT - FOR INTERNAL USE ONLY.',
    105,
    footerStartY + 28,
    { align: 'center' }
  );

  return doc.output('arraybuffer');
};
