import React from 'react';
import { FaGripVertical } from 'react-icons/fa';

function DraggableTask({ task, index, moveTask, children }) {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetIndex = index;
        
        if (draggedIndex !== targetIndex) {
            moveTask(draggedIndex, targetIndex);
        }
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="draggable-task"
            style={{ position: 'relative' }}
        >
            <div className="drag-handle" style={{
                position: 'absolute',
                left: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'grab',
                color: '#6c757d',
                zIndex: 10
            }}>
                <FaGripVertical />
            </div>
            <div style={{ paddingLeft: '25px' }}>
                {children}
            </div>
        </div>
    );
}

export default DraggableTask;