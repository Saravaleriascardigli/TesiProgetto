var canvas = new fabric.Canvas("canvas2");
var circle, isDown, origX, origY;

canvas.on('mouse:down', function(o){
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    circle = new fabric.Circle({
        left: origX,
        top: origY,
        originX: 'left',
        originY: 'top',
        startAngle: 0,
        endAngle: Math.PI / 2,
        radius: pointer.x-origX,
        angle: 0,
        fill: '',
        stroke:'red',
        strokeWidth:3,
    });
    canvas.add(circle);
});

canvas.on('mouse:move', function(o){
    if (!isDown) return;
    var pointer = canvas.getPointer(o.e);
    var radius = Math.max(Math.abs(origY - pointer.y),Math.abs(origX - pointer.x))/2;
    if (radius > circle.strokeWidth) {
        radius -= circle.strokeWidth/2;
    }
    circle.set({ radius: radius});
    
    if(origX>pointer.x){
        circle.set({originX: 'right' });
    } else {
        circle.set({originX: 'left' });
    }
    if(origY>pointer.y){
        circle.set({originY: 'bottom'  });
    } else {
        circle.set({originY: 'top'  });
    }
    canvas.renderAll();
});

canvas.on('mouse:up', function(o){
  isDown = false;
});