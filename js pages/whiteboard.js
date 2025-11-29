/* Whiteboard script - fixed backing store 1408x800, draws correctly when scaled in CSS */
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const canvas = document.getElementById('whiteboard-canvas');
    const colorEl = document.getElementById('wb-color');
    const sizeEl = document.getElementById('wb-size');
    const clearEl = document.getElementById('wb-clear');
    const downloadEl = document.getElementById('wb-download');
    if(!canvas) return;

    let drawing = false, lastX = 0, lastY = 0;
    const DEFAULT_W = 1408, DEFAULT_H = 800;
    const ratio = window.devicePixelRatio || 1;

    function initCanvas(){
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.width = Math.max(1, Math.floor(DEFAULT_W * ratio));
      canvas.height = Math.max(1, Math.floor(DEFAULT_H * ratio));
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    }

    function getPointerPos(e){
      const rect = canvas.getBoundingClientRect();
      const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function getScale(){ const rect = canvas.getBoundingClientRect(); return { sx: canvas.width / rect.width, sy: canvas.height / rect.height }; }

    function start(e){
      drawing = true; const p = getPointerPos(e); lastX = p.x; lastY = p.y;
      if(e.pointerId !== undefined && canvas.setPointerCapture) try{ canvas.setPointerCapture(e.pointerId); }catch(_){ }
    }

    function move(e){
      if(!drawing) return; e.preventDefault();
      const p = getPointerPos(e); const s = getScale();
      const lx = lastX * s.sx, ly = lastY * s.sy, nx = p.x * s.sx, ny = p.y * s.sy;
      const ctx = canvas.getContext('2d');
      ctx.beginPath(); ctx.strokeStyle = (colorEl && colorEl.value) || '#111';
      const brush = (sizeEl && sizeEl.value) || 4; ctx.lineWidth = brush * ((s.sx + s.sy) / 2);
      ctx.moveTo(lx, ly); ctx.lineTo(nx, ny); ctx.stroke();
      lastX = p.x; lastY = p.y;
    }

    function end(e){ drawing = false; try{ if(e && e.pointerId !== undefined && canvas.releasePointerCapture) canvas.releasePointerCapture(e.pointerId); }catch(_){ } }

    // events
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('touchstart', (e)=>{ start(e.touches ? e.touches[0] : e); });
    canvas.addEventListener('touchmove', (e)=>{ move(e.touches ? e.touches[0] : e); });
    canvas.addEventListener('touchend', (e)=>{ end(e.changedTouches ? e.changedTouches[0] : e); });

    function clearCanvas(){ const ctx = canvas.getContext('2d'); ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore(); }
    if(clearEl) clearEl.addEventListener('click', ()=>{ clearCanvas(); if(typeof showToast === 'function') showToast('Canvas cleared'); });

    if(downloadEl) downloadEl.addEventListener('click', ()=>{
      // download at backing store resolution to avoid resampling
      const out = document.createElement('canvas'); out.width = canvas.width; out.height = canvas.height;
      const octx = out.getContext('2d'); octx.fillStyle = '#ffffff'; octx.fillRect(0,0,out.width,out.height);
      octx.drawImage(canvas, 0, 0, out.width, out.height);
      const url = out.toDataURL('image/png'); const a = document.createElement('a'); a.href = url; a.download = 'whiteboard.png'; a.click();
    });

    try{ initCanvas(); }catch(e){}
    function updateCssHeight(){ try{ const rect = canvas.getBoundingClientRect(); canvas.style.height = Math.round(rect.width * (DEFAULT_H/DEFAULT_W)) + 'px'; }catch(e){} }
    updateCssHeight(); window.addEventListener('resize', updateCssHeight);
  });
})();
