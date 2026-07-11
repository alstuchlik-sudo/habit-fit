document.addEventListener('DOMContentLoaded', function () {
  const addRowBtn = document.getElementById('add-row-btn');
  const rowsContainer = document.getElementById('schedule-rows');
  if (!addRowBtn || !rowsContainer) return;

  addRowBtn.addEventListener('click', function () {
    const row = document.createElement('div');
    row.className = 'schedule-row';
    row.innerHTML =
      '<div><label>Chore</label><input type="text" name="chore" placeholder="e.g. school run" /></div>' +
      '<div><label>Tiny exercise</label><input type="text" name="exercise" placeholder="e.g. 10 calf raises at the door" /></div>' +
      '<div><label>Timing</label><input type="text" name="timing" placeholder="e.g. while putting on shoes" /></div>';
    rowsContainer.appendChild(row);
  });
});
