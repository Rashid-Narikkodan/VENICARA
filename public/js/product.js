// const addImgDiv = document.getElementById('addImgDiv');
// const imgInput = document.getElementById('imgInput');
// const previewContainer = document.getElementById('previewContainer');

// // Click on container triggers file input
// addImgDiv.addEventListener('click', () => imgInput.click());

// // Preview selected images
// imgInput.addEventListener('change', (e) => {
//   const files = Array.from(e.target.files);

//   files.forEach((file, index) => {
//     if (!file.type.startsWith('image/')) return; // skip non-images

//     const reader = new FileReader();
//     reader.onload = () => {
//       const imgWrapper = document.createElement('div');
//       imgWrapper.classList.add('preview-wrapper', 'd-inline-block', 'me-2', 'mb-2');
//       imgWrapper.style.position = 'relative';
//       imgWrapper.id = `preview-${index}`;

//       const img = document.createElement('img');
//       img.src = reader.result;
//       img.classList.add('img-thumbnail');
//       img.style.width = '100px';
//       img.style.height = '100px';
//       img.style.objectFit = 'cover';

//       const removeBtn = document.createElement('button');
//       removeBtn.textContent = '×';
//       removeBtn.classList.add('btn', 'btn-sm', 'btn-danger');
//       removeBtn.style.position = 'absolute';
//       removeBtn.style.top = '0';
//       removeBtn.style.right = '0';
//       removeBtn.onclick = () => imgWrapper.remove();

//       imgWrapper.appendChild(img);
//       imgWrapper.appendChild(removeBtn);
//       previewContainer.appendChild(imgWrapper);
//     };
//     reader.readAsDataURL(file);
//   });
// });


const addImgDiv = document.getElementById('addImgDiv');
const imgInput = document.getElementById('imgInput');
const previewContainer = document.getElementById('previewContainer');

let selectedFiles = [];

// Click on container triggers file input
addImgDiv.addEventListener('click', () => imgInput.click());

// Preview selected images
imgInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    if (!file.type.startsWith('image/')) return;

    selectedFiles.push(file);
    const index = selectedFiles.length - 1;
    const reader = new FileReader();
    reader.onload = () => {
      // Wrapper
      const imgWrapper = document.createElement('div');
      imgWrapper.id = `preview-${index}`;
      imgWrapper.classList.add('position-relative', 'rounded-3', 'overflow-hidden');
      imgWrapper.style.width = '10rem';
      imgWrapper.style.height = '10rem';
      imgWrapper.dataset.index = index;
      
      // Delete button
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.innerHTML = `<i class="fa-solid fa-trash-can" style="font-size: xx-small;"></i>`;
      removeBtn.classList.add('position-absolute', 'rounded-5', 'pt-0', 'pb-0', 'top-0', 'end-0');
      removeBtn.onclick = () => {
        const i = parseInt(imgWrapper.dataset.index, 10);
        selectedFiles[i] = null; // mark deleted
        imgWrapper.remove();
      };
      
      // Image
      const img = document.createElement('img');
      img.src = reader.result;
      img.alt = 'preview';
      img.style.width = '10rem';
      img.style.height = '10rem';
      img.style.objectFit = 'cover';
      
      // Append
      imgWrapper.appendChild(removeBtn);
      imgWrapper.appendChild(img);
      previewContainer.appendChild(imgWrapper);
    };
    reader.readAsDataURL(file);
  });
  imgInput.value = ''; // reset so same file can be reselected
});

// Get clean files when needed (e.g. for FormData)
function getFinalFiles() {
  return selectedFiles.filter(f => f !== null);
}











//old

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
  
// });




// Generic function to add variant
function addVariant(container) {
  const variantHTML = `
    <li><div class="variantSection mb-3">
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
    </div></li>
  `;
  container.insertAdjacentHTML('beforeend', variantHTML);
}

