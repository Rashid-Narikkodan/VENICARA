function toggleCategoryActive(id){
  fetch(`/admin/categories/active/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
}
function toggleUserStatus(id){
    if(confirm("Are you sure you want to change the status?")){
  fetch(`/admin/customers/status/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
  }
}
function toggleProductActive(id){
    if(confirm("Are you sure you want to change the status?")){
  fetch(`/admin/products/status/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
  }
}
