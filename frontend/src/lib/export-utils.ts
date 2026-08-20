import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Export cover letter to PDF
 */
export async function exportToPDF(
  content: string,
  company: string,
  jobPosition: string
) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    
    // Set font
    pdf.setFont('Arial', 'normal');
    pdf.setFontSize(11);

    // Split content into lines that fit the page width
    const lines = pdf.splitTextToSize(content, maxWidth);
    
    let yPosition = margin;
    const lineHeight = 5;
    const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
    let lineCount = 0;

    for (const line of lines) {
      if (lineCount > maxLinesPerPage) {
        pdf.addPage();
        yPosition = margin;
        lineCount = 0;
      }
      
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
      lineCount++;
    }

    const filename = `cover-letter-${company}-${jobPosition}-${new Date().getTime()}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
}

/**
 * Export cover letter to Word (.docx)
 */
export async function exportToWord(
  content: string,
  company: string,
  position: string
) {
  try {
    const paragraphs = content.split('\n').map((line) => 
      new Paragraph({
        text: line || ' ', // Empty line becomes a space
        spacing: { line: 240 }, // 1.5 line spacing
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cover-letter-${company}-${position}-${new Date().getTime()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Failed to export Word document');
  }
}
