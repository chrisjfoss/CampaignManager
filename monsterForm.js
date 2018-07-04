function createForm(monster) {
  var html = insertIntoRow(getName(monster.name));
  html += insertIntoRow(getAC(monster.ac)+getHP(monster.hpDicecount, monster.hpDice, monster.hpAdd)+getSPD(monster.spd));
  html += insertIntoRow(getStat("STR","",false,monster.str)+getStat("DEX","",false,monster.dex)+
                        getStat("CON","",false,monster.con)+getStat("INT","",false,monster.int)+
                        getStat("WIS","",false,monster.wis)+getStat("CHA","",false,monster.cha));
  html += `<h4>Saving Throws</h4>`;
  html += insertIntoRow(getStat("STR","STRsave",true,monster.strSave)+getStat("DEX","DEXsave",true,monster.dexSave)+
                        getStat("CON","CONsave",true,monster.conSave)+getStat("INT","INTsave",true,monster.intSave)+
                        getStat("WIS","WISsave",true,monster.wisSave)+getStat("CHA","CHAsave",true,monster.chaSave));
  html += insertIntoRow(getInputLists("Damage Immunities", "dimmunity", monster.dimmunities)+getInputLists("Damage Resistances", "dresistance", monster.dresistances)+getInputLists("Damage Vulnerabilities", "dvulnerability", monster.dvulnerabilities)+getInputLists("Condition Immunities", "cimmunity", monster.cimmunities));
  html += insertIntoRow(getInputLists("Senses", "sense",monster.senses)+getInputLists("Languages", "language",monster.languages));
  html += getNameDescriptionLists("Traits", "trait",monster.traits);
  html += getNameDescriptionLists("Actions", "action",monster.actions);
  html += getNameDescriptionLists("Legendary Actions", "laction",monster.legendaryActions, true);
  html += insertIntoRow(getStat("CR","",false,monster.cr));
  html += getSubmitButton();
  return html;
}

function createNewForm(pageFrom) {
  var html = createForm(
        {
          name:"", ac:"", hpDicecount:"", hpDice:"", hpAdd:"", spd:"", str:"", dex:"", con:"", int:"", wis:"", cha:"", strSave:"", dexSave:"", conSave:"", intSave:"", wisSave:"", chaSave:"",
          dimmunities:[], dresistances:[], dvulnerabilities:[], cimmunities:[], senses:[], languages:[], traits:[], actions:[], legendaryActions:[], cr:[]
        });

  $(".monsterForm .container").html(html);
  $(".monsterForm").data("from", pageFrom);
  console.log(pageFrom);
  $(".page").addClass("hidden");
  $(".monsterForm.page").removeClass("hidden");
}

function getSubmitButton() {
  return `<div class="form-group">
             <button onclick="createMonster()" class="btn btn-primary" id="add-to-list">Create Monster</button>
          </div>`;
}
function getName(name="") {
  return `<div class = "form-group col-12">
             <label for = "Name">Name</label>
             <input type = "text" name = "Name" id = "Name"
                placeholder = "Name" class = "form-control" value="${name}" required>
          </div>`;
}

function getAC(ac=10) {
  return `<div class = "form-group col-6 col-lg-3">
             <label for = "AC">AC</label>
             <input type = "number" name = "AC" value = "${ac}" id = "AC"
                placeholder = "AC" class = "form-control" required>
          </div>`;
}

function getHP(hpDicecount=0, hpDice=0, hpAdd=0) {
  return `<div class = "form-group col-12 col-lg-6">
             <label for = "HPdicecount" class="block">HP</label>
             <input type = "number" name = "HPdicecount" value = "${hpDicecount}" id = "HPdicecount"
                class = "form-control col-3 inline-block" required>d
             <input type = "number" name = "HPdice" value = "${hpDice}" id = "HPdice"
                class = "form-control col-3 inline-block" required>+
             <input type = "number" name = "HPadd" value = "${hpAdd}" id = "HPadd"
                class = "form-control col-5 inline-block" required>
          </div>`;
}

function getSPD(spd=30) {
  return `<div class = "form-group col-6 col-lg-3">
             <label for = "SPD">SPD</label>
             <input type = "number" name = "SPD" value = "${spd}" id = "SPD"
                placeholder = "SPD" class = "form-control" required>
          </div>`;
}

function getCR(cr=1) {
  return `<div class = "form-group col-3">
             <label for = "CR">CR</label>
             <input type = "number" name = "CR" value = "${cr}" id = "CR"
                placeholder = "CR" class = "form-control" required>
          </div>`;
}

function getStat(statName, identifier="", saveThrows=false, value=-10) {
  if(identifier=="") {
    identifier=statName;
  }
  if(saveThrows) {
    if(value==-10) {
      value=0;
    }
  }
  else {
    if(value==-10) {
      value=10;
    }
  }
  return `<div class = "form-group col-4 col-lg-2">
             <label for = "${statName}">${statName}</label>
             <input type = "number" name = "${statName}" value = "${value}" id = "${statName}"
                placeholder = "${statName}" class = "form-control" required>
          </div>`;
}

function getInputLists(statName, identifier, values=[]) {
  var toReturn = `<div class="form-group col-12 col-lg-6">
                    <h4 class="text-center">${statName}</h4>
                    <div data-template="${identifier}" class="repeatContents">`;
  count = 1;
  values.forEach(function(e) {
    toReturn += `<input oninput='addRow(this)' onchange='addRow(this)' type="text" name="${identifier}${count}" value="${e}" id="${identifier}${count}"
                            placeholder="${statName} ${count}" class="form-control" />`;
    count += 1;
  })
  toReturn += `<input oninput='addRow(this)' onchange='addRow(this)' type="text" name="${identifier}${count}" value="" id="${identifier}${count}"
                          placeholder="${statName} ${count}" class="form-control" />`;
  toReturn += `</div>
                  </div>`;
  return toReturn;
}

function getNameDescriptionLists(statName, identifier, values=[], sectionDescription=false) {
  var count=0;
  var toReturn = `<h3>${statName}</h3>`;

  if(sectionDescription) {
    if(values.length==0) {
      values.push({description:""});
    }
    toReturn += `<div class="row">
                  <div class="form-group col-12">
                    <textarea class="form-control" name="${identifier}description" id="${identifier}description" placeholder="${statName} Description">${values[0].description}</textarea>
                  </div>
                </div>`;
  }
  else
  {
    count+=1;
  }
  toReturn += `<div data-template="${identifier}" class="row repeatContents">`;
  values.forEach(function(e) {
  if(!sectionDescription || count != 0) {
    toReturn += `<div oninput='addRow(this)' onchange='addRow(this)' class="form-group col-12 ${identifier}">
                  <input type="text" name="${identifier}name${count}" value="${e.name}" id="${identifier}name${count}"
                      placeholder="${statName} ${count} Name" class="form-control" />
                  <textarea name="${identifier}description${count}" id="${identifier}description${count}"
                      placeholder="${statName} ${count} Description" class="form-control">${e.description}</textarea></div>`;
  }
    count += 1;
  });
  toReturn += `<div oninput='addRow(this)' onchange='addRow(this)' class="form-group col-12 ${identifier}">
                <input type="text" name="${identifier}name${count}" value="" id="${identifier}name${count}"
                    placeholder="${statName} ${count} Name" class="form-control" />
                <textarea name="${identifier}description${count}" id="${identifier}description${count}"
                    placeholder="${statName} ${count} Description" class="form-control"></textarea></div>`;
  toReturn += `</div>
            </div>`;
  return toReturn;
}

function insertIntoRow(html) {
  return `<div class="row">`+html+`</div>`;
}
