const {remote} = require('electron');
const {Menu, MenuItem} = remote

const menu = new Menu();

let rightClickPosition = null;
//Build menu one item at a time
menu.append(new MenuItem ({
  label: 'Add Campaign',
  click() {
    $("#modal .modal-body").html(`<input class="form-control form-control-sm" id="campaignName" placeholder="Campaign Name" />`)
    $("#modal .modal-footer").html(`<button type="button" id="successbtn" class="btn btn-success btn-sm" data-dismiss="modal" onclick="addCampaignFromClick()">Create</button>
                                    <button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button>`);
    $("#modal").modal();
  }
}));

menu.append(new MenuItem({type: 'separator'}));
menu.append(new MenuItem({
  label: 'Add Session',
  click() {
    e = $(document.elementFromPoint(rightClickPosition.x, rightClickPosition.y));
    let html = `Campaign: <select class="form-control" id="campaignSelect">`;
    Array.from($("#campaigns").children()).forEach(function(campaign) {
      id = $(campaign).find(".campaign-name").data("id");
      name = $(campaign).find(".campaign-name").text();
      if(e.data("id")==id) {
        html += `<option selected value="${id}">${name}</option>`;
      }
      else {
        html += `<option value="${id}">${name}</option>`;
      }
    });
    html += `</select>`;
    html += `<br/><input class="form-control" id="sessionName" placeholder="Session Name"></input>`
    $("#modal .modal-body").html(html);
    $("#modal .modal-footer").html(`<button type="button" id="successbtn" class="btn btn-success btn-sm" data-dismiss="modal" onclick="addSessionFromClick()">Create</button>
                                    <button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button>`);
    $("#modal").modal();
  }
 }));
menu.append(new MenuItem({
  label: 'Add Encounter',
  click() {
    e = $(document.elementFromPoint(rightClickPosition.x, rightClickPosition.y));
    let html = `Campaign: <select class="form-control" id="campaignSelect">`;
    Array.from($("#campaigns").children()).forEach(function(campaign) {
      id = $(campaign).find(".campaign-name").data("id");
      name = $(campaign).find(".campaign-name").text();
      if(e.data("id")==id) {
        html += `<option selected value="${id}">${name}</option>`;
      }
      else {
        html += `<option value="${id}">${name}</option>`;
      }
    });
    html += `</select>`;
    html += `Session: <select class="form-control" id="sessionSelect">`;
    sessionDB.find({ campaignID: e.data("id") }, function(error, sessions) {
      sessions.forEach(function(session) {
        html += `<option value="${session._id}">${session.name}</option>`;
      });

      html += `</select>`
      html += `<br/><input class="form-control" id="encounterName" placeholder="Encounter Name"></input>`
      $("#modal .modal-body").html(html);
      $("#modal .modal-footer").html(`<button type="button" id="successbtn" class="btn btn-success btn-sm" data-dismiss="modal" onclick="addEncounterFromClick()">Create</button>
                                      <button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button>`);
      $("#modal").modal();
    });
  }
}));

//Prevent default action of right click in chromium. Replace with our menu.
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  rightClickPosition = {x: e.x, y: e.y};
  menu.popup(remote.getCurrentWindow());
}, false);
