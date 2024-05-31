document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addShareRowButton').addEventListener('click', addShareRow);

    function addShareRow() {
        const shareContainer = document.getElementById('shareContainer');
        const newRow = document.createElement('div');
        newRow.className = 'shareRow';
        newRow.innerHTML = `
            <label for="userId">Utilisateur:</label>
            <select name="userIds[]" required>
                ${users.map(user => `<option value="${user.id}">${user.firstname} ${user.lastname}</option>`).join('')}
            </select>
            <label for="permission">Permission:</label>
            <select name="permissions[]">
                <option value="ro">Lecture</option>
                <option value="rw">Écriture</option>
            </select>
            <button type="button" class="removeShareRowButton">Retirer</button>
            <br><br>
        `;
        shareContainer.appendChild(newRow);

        newRow.querySelector('.removeShareRowButton').addEventListener('click', function() {
            shareContainer.removeChild(newRow);
        });
    }

    document.querySelectorAll('.removeShareRowButton').forEach(button => {
        button.addEventListener('click', function() {
            const shareContainer = document.getElementById('shareContainer');
            shareContainer.removeChild(button.parentElement);
        });
    });
});