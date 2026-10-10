//Update GST
export function updateGSTVisibility(toggle, container, rateInput) {
  if (toggle.checked) {
    container.classList.add("show");
    rateInput.disabled = false;
  } else {
    container.classList.remove("show");
    rateInput.disabled = true;
    rateInput.value = "";
  }
}