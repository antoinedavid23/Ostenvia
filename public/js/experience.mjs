export function mountExperience(){
 const buttons=[...document.querySelectorAll('[data-example]')],panels=[...document.querySelectorAll('[data-example-panel]')];
 const choose=e=>{const id=e.currentTarget.dataset.example;for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.example===id));for(const p of panels)p.hidden=p.dataset.examplePanel!==id;};
 for(const button of buttons)button.addEventListener('click',choose);
 return{dispose(){for(const button of buttons)button.removeEventListener('click',choose);}};
}
