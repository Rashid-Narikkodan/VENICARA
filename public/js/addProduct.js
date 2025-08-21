const addImgDiv=document.getElementById('addImgDiv')
const imgInput=document.getElementById('imgInput')
const previewContainer = document.getElementById('previewContainer');
console.log('helloooo')
addImgDiv.addEventListener('click',()=>{
  imgInput.click()
})
imgInput.addEventListener('change', (e) => {
  previewContainer.innerHTML = ''; // clear previous previews
  const files = Array.from(e.target.files);

  files.forEach(file => {
    console.log(file.type)
    if(!file.type.startsWith('image/')) return; // skip non-images

    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      img.classList.add('img-thumbnail'); // Bootstrap styling
      img.style.width = '100px'; // adjust size
      img.style.height = '100px';
      img.style.objectFit = 'cover';
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});


//form validation
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addProductForm');
  const name = document.getElementById('name');
  const description = document.getElementById('description');
  const basePrice = document.getElementById('basePrice');
  const discountPrice = document.getElementById('discountPrice');
  const stock = document.getElementById('stock');
  const category = document.getElementById('category');
  const volume = document.getElementById('volume');
  const tags = document.getElementById('tags');
  // Form submission validation
  form.addEventListener('submit', e => {
    e.preventDefault(); // stop form submission
    let errors = [];

    if (!name.value.trim()) errors.push('Product name is required.');
    if (!description.value.trim()) errors.push('Product description is required.');
    if (imgInput.files.length === 0) errors.push('At least three product image is required.');
    if (!basePrice.value || basePrice.value <= 0) errors.push('Base price must be greater than 0.');
    if (discountPrice.value && discountPrice.value < 0) errors.push('Discount price cannot be negative.');
    if (discountPrice.value && discountPrice.value>basePrice.value) errors.push('discount price must be less than base price')
    if (!stock.value || stock.value < 0) errors.push('Stock must be 0 or more.');
    if (!category.value) errors.push('Please select a category.');
    if (!volume.value.trim()) errors.push('Volume is required.');
    if (!tags.value.trim()) errors.push('Tags are required.');

    if (errors.length > 0) {
      document.getElementById('addProductError').classList.remove('d-none')
      document.getElementById('addProductError').innerHTML = errors.join('\n')
    }else{
      document.getElementById('addProductError').classList.add('d-none')
      document.getElementById('addProductError').innerHTML = ''
      form.submit()
    }
  });
});
