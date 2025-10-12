function toggleCategoryActive(id){
  fetch(`/admin/categories/active/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
}
function toggleUserStatus(id){
  fetch(`/admin/customers/status/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
  }

function toggleProductActive(id){
  fetch(`/admin/products/status/${id}?_method=PATCH`, {
      method: 'POST'
    }).then(() => {
      location.reload();
    }).catch(err => console.error(err));
  }

