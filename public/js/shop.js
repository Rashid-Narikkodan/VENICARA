
  const clear=document.getElementById("clearAll")
  clear.addEventListener("click", function () {
    document.getElementById("minPrice").value = "0";
    document.getElementById("maxPrice").value = "10000";
    
    // if you also want to clear checkboxes or radios in this filter section:
    document.querySelectorAll("#priceCollapse input[type=checkbox], #priceCollapse input[type=radio]")
      .forEach(el => el.checked = false);
  })
