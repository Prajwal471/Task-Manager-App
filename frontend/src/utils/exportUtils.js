import jsPDF from 'jspdf';

export const exportTasksToPDF = async (tasks, title = 'My Tasks') => {
    try {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        
        // Add title
        pdf.setFontSize(20);
        pdf.text(title, margin, 30);
        
        // Add date
        pdf.setFontSize(12);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 45);
        
        let yPosition = 60;
        const lineHeight = 10;
        
        // Add task statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.isDone).length;
        const pendingTasks = totalTasks - completedTasks;
        
        pdf.setFontSize(14);
        pdf.text('Task Summary:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFontSize(12);
        pdf.text(`Total Tasks: ${totalTasks}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Completed: ${completedTasks}`, margin, yPosition);
        yPosition += lineHeight;
        pdf.text(`Pending: ${pendingTasks}`, margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Add tasks list
        pdf.setFontSize(14);
        pdf.text('Tasks List:', margin, yPosition);
        yPosition += lineHeight;
        
        pdf.setFontSize(10);
        
        tasks.forEach((task, index) => {
            if (yPosition > 270) { // New page if needed
                pdf.addPage();
                yPosition = 30;
            }
            
            const status = task.isDone ? '✓' : '○';
            const priority = task.priority ? `[${task.priority.toUpperCase()}]` : '';
            const dueDate = task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : '';
            
            // Task line
            const taskText = `${status} ${task.taskName} ${priority} ${dueDate}`;
            pdf.text(taskText, margin, yPosition);
            yPosition += lineHeight;
            
            // Description if exists
            if (task.description) {
                pdf.setFontSize(8);
                const descLines = pdf.splitTextToSize(task.description, pageWidth - 2 * margin - 10);
                pdf.text(descLines, margin + 10, yPosition);
                yPosition += descLines.length * 6;
                pdf.setFontSize(10);
            }
            
            yPosition += 3; // Small gap between tasks
        });
        
        // Save the PDF
        pdf.save(`${title.replace(/\\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};

export const exportTasksToCSV = (tasks, filename = 'tasks') => {
    try {
        const headers = ['Task Name', 'Description', 'Priority', 'Category', 'Due Date', 'Status', 'Created At'];
        
        const csvContent = [
            headers.join(','),
            ...tasks.map(task => [
                `"${task.taskName.replace(/"/g, '""')}"`,
                `"${(task.description || '').replace(/"/g, '""')}"`,
                task.priority || '',
                task.category || '',
                task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
                task.isDone ? 'Completed' : 'Pending',
                task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
            ].join(','))
        ].join('\\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, `${filename}.csv`);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        return true;
    } catch (error) {
        console.error('Error generating CSV:', error);
        return false;
    }
};

export const exportTasksToJSON = (tasks, filename = 'tasks') => {
    try {
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error('Error generating JSON:', error);
        return false;
    }
};