function loadMonsterStatBlock(selector) {
  id=$(selector).data("id");
  db.findOne({ _id:id}, function(err, monster) {
    $("creature-heading h1").text(monster.name);
    var html = monsterHeading(monster)+topStats(monster)+traits(monster)+actions(monster)+legendaryActions(monster);
    $("stat-block").html(html);
    $(".page").addClass("hidden");
    $(".monsterstat.page").removeClass("hidden")
    $(".monsterstat.page").data("from", "home");
  });

  function monsterHeading(monster) {
    return `
            <creature-heading data-id="${monster._id}">
              <h1>${monster.name}</h1>
              <h4>Size type (subtype1, subtype2), alignment</h4>
            </creature-heading>
           `;
  }
  function topStats(monster) {
    return `<top-stats>
              <property-line>
                <h4>Armor Class</h4>
                <p>${monster.ac}</p>
              </property-line>
              <property-line>
                <h4>Hit Points</h4>
                <p>${monster.hp} (${monster.hpDicecount}d${monster.hpDice} + ${monster.hpAdd})</p>
              </property-line>
              <property-line>
                <h4>Speed</h4>
                <p>${monster.spd} ft.</p>
              </property-line>

              <abilities-block data-cha="${monster.cha}" data-con="${monster.con}" data-dex="${monster.dex}" data-int="${monster.int}" data-str="${monster.str}" data-wis="${monster.wis}"></abilities-block>
              <property-line>
                <h4>Saving Throws</h4>
                <p>Cha ${monster.chaSave}, Con ${monster.conSave}, Dex ${monster.dexSave}, Int ${monster.intSave}, Str ${monster.strSave}, Wis ${monster.wisSave}</p>
              </property-line>
              <property-line>
                <h4>Skills</h4>
                <p></p>
              </property-line>
              <property-line>
                <h4>Damage Immunities</h4>
                <p>${monster.dimmunities.join(", ")}</p>
              </property-line>
              <property-line>
                <h4>Senses</h4>
                <p>${monster.senses.join(", ")}</p>
              </property-line>
              <property-line>
                <h4>Languages</h4>
                <p>${monster.languages.join(", ")}</p>
              </property-line>
              <property-line>
                <h4>Challenge</h4>
                <p>${monster.cr} (5,000 XP)</p>
              </property-line>
            </top-stats>
          `;
  }

  function traits(monster) {
    var template =  `
            <h3>Traits</h3>
            `;
    var returnEmpty=true;
    monster.traits.forEach(function(trait) {
      template += `<property-block>
                      <h4>${trait.name}</h4>
                      <p>${trait.description}</p>
                   </property-block>`;
       returnEmpty=false;
    });
    if(returnEmpty)
    {
      return ``;
    }
    return template;
  }

  function actions(monster) {
    var template =  `
            <h3>Actions</h3>
            `;
    var returnEmpty = true;
    monster.actions.forEach(function(action) {
      template += `<property-block>
                      <h4>${action.name}</h4>
                      <p>${action.description}</p>
                   </property-block>`
      returnEmpty = false;
    });
    if(returnEmpty)
    {
      return ``;
    }
    return template;
  }

  function legendaryActions(monster) {
    var template =  `
            <h3>Legendary Actions</h3>
            `;
    var returnEmpty = true;
    monster.legendaryActions.forEach(function(legendaryAction) {
      template += `<property-block>
                      <h4>${legendaryAction.name}</h4>
                      <p>${legendaryAction.description}</p>
                   </property-block>`
      returnEmpty=false;
    });
    if(returnEmpty)
    {
      return ``;
    }
    return template;
  }
}

function editMonster(pageFrom) {
  db.findOne( { _id:$("creature-heading").data("id") }, function(error, monster) {
    $(".monsterForm .container").html(createForm(monster));
    $(".monsterForm").data("from", pageFrom);
    $(".page").addClass("hidden");
    $(".monsterForm.page").removeClass("hidden");
  });
}
