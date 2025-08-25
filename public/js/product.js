const addImgDiv = document.getElementById('addImgDiv');
const imgInput = document.getElementById('imgInput');
const previewContainer = document.getElementById('previewContainer');

// Click on container triggers file input
addImgDiv.addEventListener('click', () => imgInput.click());

// Preview selected images
imgInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  files.forEach((file, index) => {
    if (!file.type.startsWith('image/')) return; // skip non-images

    const reader = new FileReader();
    reader.onload = () => {
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('preview-wrapper', 'd-inline-block', 'me-2', 'mb-2');
      imgWrapper.style.position = 'relative';
      imgWrapper.id = `preview-${index}`;

      const img = document.createElement('img');
      img.src = reader.result;
      img.classList.add('img-thumbnail');
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.objectFit = 'cover';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.classList.add('btn', 'btn-sm', 'btn-danger');
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '0';
      removeBtn.style.right = '0';
      removeBtn.onclick = () => imgWrapper.remove();

      imgWrapper.appendChild(img);
      imgWrapper.appendChild(removeBtn);
      previewContainer.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
  });
});

// const addImgDiv=document.getElementById('addImgDiv')
// const imgInput=document.getElementById('imgInput')
// const previewContainer = document.getElementById('previewContainer');
// addImgDiv.addEventListener('click',()=>imgInput.click())
// imgInput.addEventListener('change', (e) => {
//   const files = Array.from(e.target.files);

//   files.forEach(file => {

//     if(!file.type.startsWith('image/')) return; // skip non-images
//     const reader = new FileReader();
//     reader.onload = () => {
//       const img = document.createElement('img');
//       img.src = reader.result;
//       img.classList.add('img-thumbnail'); // Bootstrap styling
//       img.style.width = '100px'; // adjust size
//       img.style.height = '100px';
//       img.style.objectFit = 'cover';
//       previewContainer.appendChild(img);
//     };
//     reader.readAsDataURL(file);
//   });
// });


//form validation
// document.addEventListener('DOMContentLoaded', () => {
  const addProduct = document.getElementById('addProductForm');
  // Form submission validation
  addProduct.addEventListener('submit', e => {
    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim(); ;
    const basePrice = document.getElementById('basePrice').value.trim()
    const discountPrice = document.getElementById('discountPrice').value.trim()
    const stock = document.getElementById('stock').value.trim()
    const category = document.getElementById('category').value.trim()
    const volume = document.getElementById('volume').value.trim()
    const tags = document.getElementById('tags').value.trim()
    e.preventDefault(); // stop form submission
    let errors = [];

    if (!name) errors.push('Product name is required.');
    if (!description) errors.push('Product description is required.');
    if (imgInput.files.length === 0) errors.push('At least three product image is required.');
    if (!basePrice || basePrice <= 0) errors.push('Base price must be greater than 0.');
    if (discountPrice && discountPrice < 0) errors.push('Discount price cannot be negative.');
    if (discountPrice && discountPrice>basePrice) errors.push('discount price must be less than base price')
    if (!stock || stock < 0) errors.push('Stock must be 0 or more.');
    if (!category) errors.push('Please select a category.');
    if (!volume) errors.push('Volume is required.');
    if (!tags) errors.push('Tags are required.');

    if (errors.length > 0) {
      document.getElementById('addProductError').classList.remove('d-none')
      document.getElementById('addProductError').innerHTML = errors.join('\n')
    }else{
      document.getElementById('addProductError').classList.add('d-none')
      document.getElementById('addProductError').innerHTML = ''
      addProduct.submit()
    }
  });
// });

const editProductForm = document.getElementById('editProductForm');
editProductForm.addEventListener('submit', e => {
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value.trim();
  const tags = document.getElementById('tags').value.trim();
    e.preventDefault(); // stop form submission
    let errors = [];
    if (!name) errors.push('Product name is required.');
    if (!description) errors.push('Product description is required.');
    if (!category) errors.push('Please select a category.');
    if (!tags) errors.push('Tags are required.');
    for(let i=0;i<document.getElementsByName('volume').length;i++){
      const bp=document.getElementsByName('basePrice')[i].value.trim()
      const dp=document.getElementsByName('discountPrice')[i].value.trim()
      const st=document.getElementsByName('stock')[i].value.trim()
      const vol=document.getElementsByName('volume')[i].value.trim()
      if (!bp || bp <= 0) errors.push(`Base price must be greater than 0 in variant ${i+1}.`);
      if (dp && dp < 0) errors.push(`Discount price cannot be negative in variant ${i+1}.`);
      if (dp && dp>bp) errors.push(`Discount price must be less than base price in variant ${i+1}.`);
      if (!st || st < 0) errors.push(`Stock must be 0 or more in variant ${i+1}.`);
      if (!vol) errors.push(`Volume is required in variant ${i+1}.`);
    }
    if (errors.length > 0) {
      document.getElementById('editProductError').classList.remove('d-none')
      document.getElementById('editProductError').innerHTML = errors.join('\n')
    }else{
      console.log(errors)
      document.getElementById('editProductError').classList.add('d-none')
      document.getElementById('editProductError').innerHTML = ''
      editProductForm.submit()
    }
  });
function removeImg(image,index,id){
  fetch(`/admin/products/edit/removeImg/${id}?_method=PATCH`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({image,index})
  }).then((res)=>res.json()).then(data=>{
    if(data.success){
      const previewDiv = document.getElementById(`preview-${index}`);
      if (previewDiv) {
        previewDiv.remove();
      }
    }
  })
}
// Get variant containers for both forms
const addProductVariantContainer = document.querySelector('#addProductForm #variantContainer');
const editProductVariantContainer = document.querySelector('#editProductForm #variantContainer');

// Generic function to add variant
function addVariant(container) {
  const variantHTML = `
    <div class="variantSection mb-3">
      <div class="row m-0 g-3">
        <div class="col-md-3">
          <label class="form-label mt-0">Base Price (₹)</label>
          <input name="basePrice" type="number" class="form-control" placeholder="300">
        </div>
        <div class="col-md-3">
          <label class="form-label mt-0">Discount Price (₹)</label>
          <input name="discountPrice" type="number" class="form-control" placeholder="250">
        </div>
        <div class="col-md-3">
          <label class="form-label mt-0">Stock</label>
          <input name="stock" type="number" class="form-control" placeholder="50">
        </div>
        <div class="col-md-2">
          <label class="form-label">Volume (ml)</label>
          <input name="volume" type="text" class="form-control" placeholder="50, 100">
        </div>
        <div class="col-md-1 d-flex align-items-end">
          <button type="button" class="btn btn-danger delete-variant-btn">Delete</button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', variantHTML);
}

// Event delegation for delete buttons
[addProductVariantContainer, editProductVariantContainer].forEach(container => {
  container?.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-variant-btn')) {
      const variantSection = e.target.closest('.variantSection');
      if (variantSection) variantSection.remove();
    }
  });
});
