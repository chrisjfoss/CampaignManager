let $ = require('jquery'); //jQuery now loaded and assigned to $
let fs = require('fs');
let Datastore = require('nedb')
let filename = 'monsters';
let database = '/data/monsterdatabase'

let count = 0;

const {ipcMain} = require('electron')
var db = new Datastore({filename: database, autoload: true})

function createMonster() {
  let monster = getMonsterData();
  console.log(monster);
  db.insert(monster, function(err, newMonster) {
    console.log(err);
    console.log(newMonster);
    addEntry(newMonster.name, newMonster.hp, monster.cr);
  });
}

function goBack(e) {
  var previous = $(e).closest(".page").data("from");
  $(".page").addClass("hidden");
  $("."+previous).removeClass("hidden");
}
function getMonsterData() {
  let hp = 0
  hp = parseInt(parseInt($("#HPadd").val())+parseInt($("#HPdicecount").val())*(parseFloat(parseInt($("#HPdice").val())+1)/2));
  let dimmunities = getRepeatContentArray(".repeatContents[data-template='dimmunity']");
  let dresistances = getRepeatContentArray(".repeatContents[data-template='dresistance']");
  let dvulnerabilities = getRepeatContentArray(".repeatContents[data-template='dvulnerability']");
  let cimmunities = getRepeatContentArray(".repeatContents[data-template='cimmunity']");
  let senses = getRepeatContentArray(".repeatContents[data-template='senses']");
  let languages = getRepeatContentArray(".repeatContents[data-template='languages']");
  let traits = getRepeatContentArray(".repeatContents[data-template='traits']", true);
  let actions = getRepeatContentArray(".repeatContents[data-template='actions']", true);
  let legendaryActions = getRepeatContentArray(".repeatContents[data-template='legendaryActions']", true);
  return {
    name: $("#Name").val(),
    hp: hp,
    hpAdd: $("#HPadd").val(),
    hpDice: $("#HPdice").val(),
    hpDicecount: $("#HPdicecount").val(),
    cr: $("#CR").val(),
    ac: $("#AC").val(),
    spd: $("#SPD").val(),
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
    legendaryActions: legendaryActions
  };
}

$("#click-counter").text(count.toString());
$("#countbtn").on('click', () => {
  ++count;
  $("#click-counter").text(count);
});

function getRepeatContentArray(selector, hasDescription=false) {
  let result = []
  if(!hasDescription) {
    Array.from($(selector).children()).forEach(function(e) {
      if($(e).val()!="") {
        result.push($(e).val());
      }
    });
  }
  else {
    Array.from($(selector).children()).forEach(function(e) {
      if($(e).find("input").val()!="" || $(e).find("textarea").val()!="") {
        result.push({name: $(e).find("input").val(), description: $(e).find("textarea").val()});
      }
    });
  }
  return result
}

function addEntry(name, hp, cr, id="") {
  if(name && hp) {
    let newMonster = `<div onclick="loadMonsterStatBlock(this);" data-id=${id} class="card"><div class="card-body">${name}<span style="font-size:12px;position:absolute;top:0px;right:10px;">${cr}</span></div></div>`;
    $("#monsters").append(newMonster);
  }
}

function loadAndDisplayMonsters() {
  db.find({}).exec(function(err,monsters){
    monsters.forEach(function(monster){
      addEntry(monster.name, monster.hp, monster.cr, monster._id);
    });
  });
}

function addRow(e) {
  var parent = $(e).closest(".repeatContents");
  var emptyInputs = parent.find("input:text").filter(function() { return this.value == ""; });
  if(emptyInputs.length == 0) {
    parent.append(getTemplate(parent.data("template"), parent.find("input").length+1));
  }
}

function getTemplate(templateName, count) {
  switch(templateName) {
    case "sense":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='sense${count}' value='' id='sense${count}' placeholder='Sense ${count}' class='form-control' />`;
    case "language":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='language${count}' value='' id='language${count}' placeholder='Language ${count}' class='form-control' />`;
    case "dimmunity":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dimmunity${count}' value='' id='dimmunity${count}' placeholder='Damage Immunity ${count}' class='form-control' />`;
    case "dresistance":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dresistance${count}' value='' id='dresistance${count}' placeholder='Damage Resistance ${count}' class='form-control' />`;
    case "dvulnerability":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='dvulnerability${count}' value='' id='dvulnerability${count}' placeholder='Damage Vulnerability ${count}' class='form-control' />`;
    case "cimmunity":
      return `<input oninput='addRow(this)' onchange='addRow(this)' type='text' name='cimmunity${count}' value='' id='cimmunity${count}' placeholder='Condition Immunity ${count}' class='form-control' />`;
    case "trait":
      return `<div oninput='addRow(this)' onchange='addRow(this)' class='form-group col-12 traits'>
                <input type='text' name='traitname${count}' value='' id='traitname${count}' placeholder='Trait ${count} Name' class='form-control' />
                <textarea name='traitdescription${count}' id='traitdescription${count}' placeholder="Trait ${count} Description" class='form-control'></textarea>
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
                <textarea name="lactiondescription${count}" value="" id="lactiondescription${count}"
                    placeholder="Legendary Action ${count} Description" value="" class="form-control"></textarea>
              </div>`;
  }
}
loadAndDisplayMonsters();
