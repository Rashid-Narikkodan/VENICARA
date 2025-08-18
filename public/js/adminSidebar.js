const arrow=document.getElementById('arrow')
const sidebar=document.getElementById('sidebar')
arrow.addEventListener('click',(e)=>{
  sidebar.classList.toggle('collapsed')
  if(arrow.querySelector('i').classList.contains('fa-angles-left')){
    arrow.querySelector('i').classList.replace('fa-angles-left','fa-angles-right')
    arrow.classList.add('justify-content-center')
  }else if(arrow.querySelector('i').classList.contains('fa-angles-right')){
    arrow.querySelector('i').classList.replace('fa-angles-right','fa-angles-left')
  }
})