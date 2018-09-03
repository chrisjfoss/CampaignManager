const {ipcMain} = require('electron')
const DataPath = '/data/';
const bootstrap = require('bootstrap')
let $ = require('jquery'); //jQuery now loaded and assigned to $
let fs = require('fs');
let Datastore = require('nedb')
let filename = 'monsters';
let database = DataPath+'monsterdatabase'

let count = 0;


var db = new Datastore({filename: database, autoload: true})

function filterMonsters(e) {
  let text = $(e).val();
  $("#monsters .card").addClass("hidden");
  Array.from($("#monsters .card .card-body")).forEach(function(monster) {
    if($(monster).text().toLowerCase().includes(text.toLowerCase()))
    {
      $(monster).parent().removeClass("hidden");
    }
  });
}

function createMonster() {
  let monster = getMonsterData();
  let id = $("#monsterId").val();
  if(id != "undefined")
  {
    db.update({ _id: id }, monster, {}, function() {});
  }
  else
  {
    db.insert(monster, function(err, newMonster) {
      addEntry(newMonster.name, newMonster.hp, monster.cr);
    });
  }

  switchToPage("home");
}

function switchToPage(page) {
  $(".page").addClass("hidden");
  $(".page."+page).removeClass("hidden");
}

function goBack(e) {
  let previous = $(e).closest(".page").data("from");
  $(".page").addClass("hidden");
  $("."+previous).removeClass("hidden");
}

function getMonsterData() {
  //A secondary cr for when the creature is outside of its "home" environment
  let hp = 0
  hp = parseInt(parseInt($("#HPadd").val())+parseInt($("#HPdicecount").val())*(parseFloat(parseInt($("#HPdice").val())+1)/2));
  let dimmunities = getRepeatContentArray(".repeatContents[data-template='dimmunity']");
  let dresistances = getRepeatContentArray(".repeatContents[data-template='dresistance']");
  let dvulnerabilities = getRepeatContentArray(".repeatContents[data-template='dvulnerability']");
  let cimmunities = getRepeatContentArray(".repeatContents[data-template='cimmunity']");
  let senses = getRepeatContentArray(".repeatContents[data-template='sense']");
  let languages = getRepeatContentArray(".repeatContents[data-template='language']");
  let traits = getRepeatContentArray(".repeatContents[data-template='trait']", true);
  let actions = getRepeatContentArray(".repeatContents[data-template='action']", true);
  let legendaryActions = getRepeatContentArray(".repeatContents[data-template='legendaryAction']", true);
  let speeds = getRepeatContentArray(".repeatContents[data-template='speed']", false, true);

  let lairActions = getRepeatContentArray(".repeatContents[data-template='lairAction']", true);

  let description = $("#Description").html();
  let environments = getRepeatContentArray(".repeatContents[data-template='environment']");
  let skills = getRepeatContentArray(".repeatContents[data-template='skill']", false, true);
  let nonEnvironmentCR = parseFloat($("#nonEnvironmentCR").val());

  return {
    name: $("#Name").val(),
    size: $("#Size").val(),
    order: $("#Order").val(),
    morality: $("#Morality").val(),
    description: description,
    environments: environments,
    nonEnvironmentCR: nonEnvironmentCR,
    hp: hp,
    hpAdd: $("#HPadd").val(),
    hpDice: $("#HPdice").val(),
    hpDicecount: $("#HPdicecount").val(),
    cr: parseFloat($("#CR").val()),
    ac: $("#AC").val(),
    speeds: speeds,
    skills: skills,
    str: $("#STR").val(),
    dex: $("#DEX").val(),
    con: $("#CON").val(),
    int: $("#INT").val(),
    wis: $("#WIS").val(),
    cha: $("#CHA").val(),
    strSave: $("#STRsave").val(),
    dexSave: $("#DEXsave").val(),
    conSave: $("#CONsave").val(),
    intSave: $("#INTsave").val(),
    wisSave: $("#WISsave").val(),
    chaSave: $("#CHAsave").val(),
    dimmunities: dimmunities,
    dresistances: dresistances,
    dvulnerabilities: dvulnerabilities,
    cimmunities: cimmunities,
    senses: senses,
    languages: languages,
    traits: traits,
    actions: actions,
    legendaryActions: legendaryActions,
    lairActions: lairActions,
    type: $("#Type").val()
  };
}

$("#click-counter").text(count.toString());
$("#countbtn").on('click', () => {
  ++count;
  $("#click-counter").text(count);
});

function getRepeatContentArray(selector, hasDescription=false, hasNumberDescription=false) {
  let result = []
  if(!hasDescription && !hasNumberDescription) {
    Array.from($(selector).children()).forEach(function(e) {
      if($(e).val()!="") {
        result.push($(e).val());
      }
    });
  }
  else if(hasDescription && !hasNumberDescription) {
    Array.from($(selector).children()).forEach(function(e) {
      if($(e).find("input").val()!="" || $(e).find("textarea").val()!="") {
        result.push({name: $(e).find("input").val(), description: $(e).find("textarea").val()});
      }
    });
  }
  else if(!hasDescription && hasNumberDescription) {
    Array.from($(selector).children()).forEach(function(e) {
      if($(e).children().first().val()!="") {
        result.push([$(e).children().first().val(), $(e).children().last().val()]);
      }
    });
  }
  return result
}

function addEntry(name, hp, cr, id="") {
  if(name && hp) {
    let newMonster = `<div onclick="loadMonsterStatBlock(this);" data-id=${id} class="card"><div class="card-body">${name}<span style="font-size:12px;position:absolute;bottom:0px;right:10px;">CR: ${cr}</span></div></div>`;
    $("#monsters").append(newMonster);
  }
}

function loadAndDisplayMonsters() {
  db.find({}).sort( { cr: 1, name: 1 } ).exec(function(err,monsters){
    monsters.forEach(function(monster){
      addEntry(monster.name, monster.hp, monster.cr, monster._id);
    });
  });
}

function addRow(e, groupSize=1) {
  let parent = $(e).closest(".repeatContents");
  let emptyInputs = parent.find("input:text").filter(function() { return this.value == ""; });
  if(emptyInputs.length == 0) {
    parent.append(getTemplate(parent.data("template"), parent.find("input").length/groupSize+1));
  }
}

function getTemplate(templateName, count, value="") {
  switch(templateName) {
    case "sense":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='sense${count}' value='${value}' id='sense${count}' placeholder='Sense ${count}' class='form-control' />`;
    case "language":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='language${count}' value='${value}' id='language${count}' placeholder='Language ${count}' class='form-control' />`;
    case "dimmunity":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dimmunity${count}' value='${value}' id='dimmunity${count}' placeholder='Damage Immunity ${count}' class='form-control' />`;
    case "dresistance":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dresistance${count}' value='${value}' id='dresistance${count}' placeholder='Damage Resistance ${count}' class='form-control' />`;
    case "dvulnerability":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dvulnerability${count}' value='${value}' id='dvulnerability${count}' placeholder='Damage Vulnerability ${count}' class='form-control' />`;
    case "cimmunity":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='cimmunity${count}' value='${value}' id='cimmunity${count}' placeholder='Condition Immunity ${count}' class='form-control' />`;
    case "environment":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='environment${count}' value='${value}' id='environment${count}' placeholder='Environment ${count}' class='form-control' />`;
    case "skill":
      let skilldescription = value[0];
      let skillvalue = value[1];
      if(value.length===0) {
        skilldescription="";
        skillvalue = 0;
      }
      return `<div class="form-inline"><input oninput='addRow(this,2)' onchange='addRow(this,2)' type='text' name='skilldescription${count}' value='${skilldescription}' id='skilldescription${count}' placeholder='Skill Description ${count}' class='form-control col-9' />
              <input oninput='addRow(this)' onchange='addRow(this,2)' type='number' name='skill${count}' value='${skillvalue}' id='speed${count}' placeholder='Skill ${count}' class='form-control col-3' /></div>`;
    case "speed":
      let speeddescription = value[0];
      let speedvalue = value[1];
      if(value.length==0) {
        speeddescription="";
        speedvalue = 0;
      }
      console.log(speeddescription);
      let toReturn=``;
      if(count==1 && value=="") {
        toReturn += `<div class="form-inline"><input type='text' name='speeddescription0' value='Default' id='speeddescription0' placeholder='Speed Description 0' class='form-control col-9' disabled />
                <input type='number' name='speed0' value='0' id='speed0' placeholder='Speed 0' class='form-control col-3' /></div>`;
      } else if(count==1) {
        return `<div class="form-inline"><input type='text' name='speeddescription0' value='${speeddescription}' id='speeddescription0' placeholder='Speed Description 0' class='form-control col-9' disabled />
                <input type='number' name='speed0' value='${speedvalue}' id='speed0' placeholder='Speed 0' class='form-control col-3' /></div>`;
      }
      return toReturn += `<div class="form-inline"><input oninput='addRow(this,2)' onchange='addRow(this,2)' type='text' name='speeddescription${count}' value='${speeddescription}' id='speeddescription${count}' placeholder='Speed Description ${count}' class='form-control col-9' />
              <input oninput='addRow(this)' onchange='addRow(this,2)' type='number' name='speed${count}' value='${speedvalue}' id='speed${count}' placeholder='Speed ${count}' class='form-control col-3' /></div>`;
    case "trait":
      return `<div oninput='addRow(this)' onchange='addRow(this)' class='form-group col-12 traits'>
                <input type='text' name='traitname${count}' value='${value["name"]}' id='traitname${count}' placeholder='Trait ${count} Name' class='form-control' />
                <textarea name='traitdescription${count}' id='traitdescription${count}' placeholder="Trait ${count} Description" class='form-control'>${value["description"]}</textarea>
              </div>`;
    case "action":
      return `<div oninput='addRow(this)' onchange='addRow(this)' class="form-group col-12 action">
                <input type="text" name="actionname${count}" value="" id="actionname${count}"
                    placeholder="Action ${count} Name" class="form-control" />
                <textarea name="actiondescription${count}" value="" id="actiondescription${count}"
                    placeholder="Action ${count} Description" class="form-control"></textarea>
              </div>`;
    case "legendaryAction":
      return `<div oninput='addRow(this)' onchange='addRow(this)' class="form-group col-12">
                <input type="text" name="lactionname${count}" value="" id="lactionname${count}"
                    placeholder="Legendary Action ${count} Name" class="form-control" />
                <textarea name="legendaryActiondescription${count}" value="" id="legendaryActiondescription${count}"
                    placeholder="Legendary Action ${count} Description" value="" class="form-control"></textarea>
              </div>`;
    case "lairAction":
      return `<div oninput='addRow(this)' onchange='addRow(this)' class="form-group col-12">
                <input type="text" name="lairActionname${count}" value="" id="lairActionname${count}"
                    placeholder="Lair Action ${count} Name" class="form-control" />
                <textarea name="lairActiondescription${count}" value="" id="lairActiondescription${count}"
                    placeholder="Lair Action ${count} Description" value="" class="form-control"></textarea>
              </div>`;
  }
}
loadAndDisplayMonsters();
