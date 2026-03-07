// 3D tilt + SVG border-draw effect for .cs-closure
(function () {
  const closure = document.querySelector('.cs-closure');
  if (!closure) return;

  closure.addEventListener('mousemove', e => {
    const r  = closure.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    closure.style.transform = `perspective(700px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg) translateZ(20px)`;
    closure.style.boxShadow = `${-dx * 20}px ${dy * 20}px 56px rgba(0,0,0,0.10)`;
  });

  closure.addEventListener('mouseleave', () => {
    closure.style.transform = '';
    closure.style.boxShadow = '';
  });
})();
