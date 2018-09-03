let campaignDatabaseName = 'campaigns'
var campaignDB = new Datastore({filename: DataPath+'campaigndatabase', autoload: true})
var sessionDB = new Datastore({filename: DataPath+'sessiondatabase', autoload: true})
var encounterDB = new Datastore({filename: DataPath+'encounterdatabase', autoload: true})
var monsterInstanceDB = new Datastore({filename: DataPath+'monsterinstancedatabase', autoload: true})
var pendingSave = false;

if(!fs.existsSync(DataPath+'/notes'))
{
  fs.mkdirSync(DataPath+'/notes/');
}

function filterCampaigns(e) {
  let text = $(e).val();
  $("#campaigns .campaign").addClass("hidden");
  Array.from($("#campaigns .campaign")).forEach(function(campaign) {
    if($(campaign).text().toLowerCase().includes(text.toLowerCase())) {
      $(campaign).removeClass("hidden");
    }
  });
}

function selectRow(e) {
  $(".selected-row").removeClass("selected-row");
  $(e).addClass("selected-row");
}


function sizeTextArea(e) {
  $('textarea').each(function () {
    this.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
  }).on('input', function () {
    e.style.height = 'auto';
    e.style.height = (e.scrollHeight) + 'px';
    e.style.margin = "0 0 50px 0";
  });
}

function saveNoteChanges(e)
{
  sizeTextArea(e);
  let id = $(e).data("id");
  if(pendingSave == false)
  {
    pendingSave = true;
    fs.writeFile(DataPath+'/notes/'+id, $(e).html(), function (err) {
      pendingSave = false;
      if(err) throw err;
      console.log("Saved!");
      console.log($(e).html());
      campaignDB.update({ _id: id }, { $set: { notes: DataPath+'/notes/'+id } }, function() {});
      encounterDB.update({ _id: id }, { $set: { notes: DataPath+'/notes/'+id } }, function() {});
      sessionDB.update({ _id: id }, { $set: { notes: DataPath+'/notes/'+id } }, function() {});
    });
  }
}

function getCampaignPage(e) {
  let id = $(e).data("id");
  switch($(e).data("type")) {
    case "campaign":
      campaignDB.findOne({ _id: id }, function(error, campaign) {
        fs.readFile(campaign.notes, function(ferror, data) {
          let html = `<h2 class="text-center">${campaign.name}</h2>`;
          html += `<div class="col-12"><div data-type="campaign" data-id="${id}" class="form-control" oninput="saveNoteChanges(this)" contenteditable="true">`
          if(data)
          {
            html += document.createTextNode(data).data;
          }
          html += `</div></div>`;
          $(".campaign .campaign-notes").html(html);
        });
      });
      break;
    case "session":
      sessionDB.findOne({ _id: id }, function(error, session) {
        fs.readFile(session.notes, function(ferror, data) {
          let html = `<h2 class="text-center">${session.name}</h2>`;
          html += `<div class="col-12"><div data-type="session" data-id="${id}" class="form-control" oninput="saveNoteChanges(this)" contenteditable="true">`
          if(data)
          {
            html += document.createTextNode(data).data;
          }
          html += `</div></div>`;
          $(".campaign .campaign-notes").html(html);
        });
      });
      break;
    case "encounter":
      encounterDB.findOne({ _id: id }, function(error, encounter) {
        fs.readFile(encounter.notes, function(ferror, data) {
          let html = `<h2 class="text-center">${encounter.name}</h2>`;
          html += `<button class="btn btn-primary" onclick="addMonsterFromDropdown('${encounter._id}');">Add Monster</button>`;
          html += `<div id="monsterInstances">`;
          monsterInstanceDB.find({ encounterID: encounter._id }).exec(function(monsterInstanceError, monsterInstances) {
            monsterInstances.forEach(function(monsterInstance) {
              html += addMonsterInstanceCard(monsterInstance);
            });
            html += `</div>`;
            html += `<div class="col-12"><div data-type="encounter" data-id="${id}" class="form-control" oninput="saveNoteChanges(this)" contenteditable="true">`
            if(data)
            {
              html += document.createTextNode(data).data;
            }
            html += `</div></div>`;
            $(".campaign .campaign-notes").html(html);
          });
        });
      });
      break;
    default:
      break;
  }
  switchToPage("campaign");
}

function addMonsterFromDropdown(id) {
  let html = `Monster: <select data-encounterid="${id}" class="form-control" id="monsterSelect">`;
  db.find({}).sort( { cr: 1, name: 1 } ).exec(function(err, monsters) {
    monsters.forEach(function(monster) {
      html += `<option value="${monster._id}">${monster.name} CR:${monster.cr}</option>`;
    });
    html += `</select>`;
    html += `Amount: <input type="number" class="form-control" id="monsterAmount" step="1" />`
    $("#modal .modal-body").html(html);
    $("#modal .modal-footer").html(`<button type="button" id="successbtn" class="btn btn-success btn-sm" data-dismiss="modal" onclick="addMonsterFromClick()">Add</button>
                                    <button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button>`);
    $("#modal").modal();
  });
}

function addMonsterInstanceCard(monsterInstance) {
  let html = `<div class="card">${monsterInstance.amount}x ${monsterInstance.name} CR: ${monsterInstance.cr}</div>`;
  $("#monsterInstances").append(html);
  return html;

}

function addMonsterFromClick() {
  let e = $("#monsterSelect");
  addMonsterInstance(e.val(), e.data("encounterid"), parseInt($("#monsterAmount").val()));
}

function expandSection(e) {
  $(e).find("i").toggleClass("fa-angle-up");
  $(e).find("i").toggleClass("fa-angle-down");
  switch($(e).data("type")) {
    case "campaign":
      initializeSessions(e);
      break;
    case "session":
      initializeEncounters(e);
      break;
    default:
      break;
  }
}

function addCampaignEntry(campaign) {
  let toAdd = `<div><div onmousedown="selectRow(this);getCampaignPage(this);expandSection(this);" class="campaign-name campaign-row campaign" data-type="campaign" data-id="${campaign._id}"><i class="fas fa-xs fa-angle-up"></i> ${campaign.name}</div><div class="sessions"></div>`;
  $("#campaigns").append(toAdd+`</div>`);
}

function initializeEncounters(e) {
  sessionId = $(e).data("id");
  if($(e).parent().find(".encounters").children().length > 0) {
    $(e).parent().find(".encounters").html("");
  }
  else {
    result = ``;
    encounterDB.find({ sessionID: sessionId }, function(error, encounters) {
      encounters.forEach(function(encounter) {
        result += `<div onmousedown="selectRow(this);getCampaignPage(this);" class="campaign-row encounter encounter-name" data-type="encounter" data-id="${encounter._id}">${encounter.name}</div>`;
      });
      $(e).parent().find(".encounters").html(result);
    });
  }
}

function initializeSessions(e) {
  campaignID = $(e).data("id");
  if($(e).parent().find(".sessions").children().length > 0) {
    $(e).parent().find(".sessions").html("");
  }
  else {
    result = ``;
    sessionDB.find({ campaignID: campaignID }, function(error, sessions) {
      sessions.forEach(function(session) {
        result += `<div><div onmousedown="selectRow(this);getCampaignPage(this);expandSection(this);" class="campaign-row session session-name" data-type="session" data-id="${session._id}" style="padding-left:20px"><i class="fas fa-xs fa-angle-up"></i> ${session.name}</div><div class="encounters"></div></div>`;
        $(e).parent().find(".sessions").html(result);
      });
    });
  }
}

function initializeCampaigns() {
  $("#campaigns").html("");
  campaignDB.find({}, function(error, campaigns) {
    campaigns.forEach(function(campaign) {
      addCampaignEntry(campaign);
    });
  });
}


function getCampaigns() {
  campaignDB.find({}, function(error, campaigns) {
    return campaigns;
  });
}

function addCampaignFromClick() {
  let name = $("#campaignName").val();
  addCampaign(name);
}

function addSessionFromClick() {
  let name = $("#sessionName").val();
  let campaignID = $("#campaignSelect").val();
  addSession(name, campaignID);
}

function addEncounterFromClick() {
  let name = $("#encounterName").val();
  let sessionID = $("#sessionSelect").val();
  addEncounter(name, sessionID);
}

function addCampaign(name) {
  let campaign = getNewCampaignData(name);
  campaignDB.insert(campaign, function(err, newCampaign) {
    campaignDB.update({ _id: newCampaign._id }, { $set: { notes: DataPath+'notes/'+newCampaign._id } }, {multi: false }, function(error, result) {
      initializeCampaigns();
    });
  });
}

function addSession(name, campaignID) {
  let session = getNewSession(name, campaignID);
  campaignDB.findOne({ _id: campaignID }, function(error, campaign) {
    sessionDB.insert(session, function(sessionError, newSession) {
      campaign.sessions.push(newSession._id);
      campaignDB.update({ _id: campaignID }, campaign, function() {});
      sessionDB.update({ _id: newSession._id }, { $set: { notes: DataPath+'notes/'+newSession._id } }, { multi: false }, function(error, result) {
        initializeSessions();
      });
    });
  });
}

function addEncounter(name, sessionID) {
  let encounter = getNewEncounter(name, sessionID);
  sessionDB.findOne({ _id: sessionID }, function(error, session) {
    encounterDB.insert(encounter, function(encounterError, newEncounter) {
      session.encounters.push(newEncounter._id);
      sessionDB.update({ _id: sessionID }, session, function() {});
      encounterDB.udpate({ _id: newEncounter._id }, { $set: { notes: DataPath+'notes/'+newEncounter._id } }, { multi: false }, function(error, result) {
        initializeEncounters();
      });
    });
  });
}

function getNewCampaignData(name) {
  return {
    name: name,
    notes: "",
    sessions: []
  }
}

function getSessions(campaignID) {
  sessionDB.find({ campaignID: campaignID }, function(error, sessions) {
    return sessions;
  });
}

/*
function addSessionNoName(e) {
  $(e).parent().append(`<input class="col-3 form-control form-control-sm" type="text"></input>`);
}
*/


function getNewSession(name, campaignID) {
  return {
    name: name,
    notes: "",
    campaignID: campaignID,
    encounters: []
  }
}

function getEncounters(sessionID) {
  encounterDB.find( { sessionID: sessionID }, function(error, encounters) {
    return encounters;
  });
}

function addEncounter(name, sessionID) {
  let encounter = getNewEncounter(name, sessionID);
  sessionDB.findOne({ _id: sessionID }, function(error, session) {
    encounterDB.insert(encounter, function(encounterError, newEncounter) {
      session.encounters.push(newEncounter._id);
      sessionDB.update({ _id: sessionID }, session, function(){});
    });
  });
}

function getNewEncounter(name, sessionID) {
  return {
    name: name,
    notes: "",
    sessionID: sessionID,
    monsterInstances: []
  }
}

function getMonsterInstances(encounterID) {
  monsterInstanceDB.find({ encounterID: encounterID }, function(error, monsterInstances) {
    return monsterInstances;
  });
}

async function addMonsterInstance(monsterID, encounterID, amount) {
  db.findOne({ _id: monsterID }, function(err, monster) {

    let monsterInstance = Object.keys(monster).reduce((result, key) => {
      if(key !== "_id") {
         result[key] = monster[key];
      }
      return result;
    }, {});
    monsterInstance.parentId = monster._id;
    monsterInstance.encounterID = encounterID;
    monsterInstance.notes = "";
    monsterInstance.amount = amount;

    encounterDB.findOne({ _id: encounterID }, function(err, encounter)
    {
      monsterInstanceDB.insert(monsterInstance, function(err, newMonsterInstance) {
        encounter.monsterInstances.push(newMonsterInstance._id);
        encounterDB.update({ _id: encounterID }, encounter, function(){});
        addMonsterInstanceCard(newMonsterInstance);
      });
    });
  });
}

function getNewMonsterInstance(monsterID, encounterID, amount) {

}

$(document).ready(function() {
    initializeCampaigns();
});
