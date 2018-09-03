function loadMonsterStatBlock(selector) {
  id=$(selector).data("id");
  db.findOne({ _id:id}, function(err, monster) {
    $("creature-heading h1").text(monster.name);
    var html = monsterHeading(monster)+topStats(monster)+traits(monster)+actions(monster)+legendaryActions(monster)+lairActions(monster)+getDescription(monster);
    $("stat-block").html(html);
    $(".page").addClass("hidden");
    $(".monsterstat.page").removeClass("hidden")
    $(".monsterstat.page").data("from", "home");
  });
}
  function monsterHeading(monster) {
    return `
            <creature-heading data-id="${monster._id}">
              <h1>${monster.name}</h1>
              <h2>${monster.size} ${monster.type}, ${monster.order} ${monster.morality}</h2>
            </creature-heading>
           `;
  }
  function topStats(monster) {
    topStats = `<top-stats>`;
    topStats += addProperties(monster.ac, "Armor Class");
    topStats += `
              <property-line>
                <h4>Hit Points</h4>
                <p>${monster.hp} (${monster.hpDicecount}d${monster.hpDice} + ${monster.hpAdd})</p>
              </property-line>
              <property-line>
                <h4>Speed</h4>
                <p>${getDescriptionNumberValues(monster.speeds, "ft.")}</p>
              </property-line>

              <abilities-block data-cha="${monster.cha}" data-con="${monster.con}" data-dex="${monster.dex}" data-int="${monster.int}" data-str="${monster.str}" data-wis="${monster.wis}"></abilities-block>
              <property-line>
                <h4>Saving Throws</h4>
                <p>Cha ${monster.chaSave}, Con ${monster.conSave}, Dex ${monster.dexSave}, Int ${monster.intSave}, Str ${monster.strSave}, Wis ${monster.wisSave}</p>
              </property-line>
              <property-line>
                <h4>Skills</h4>
                <p>${getDescriptionNumberValues(monster.skills)}</p>
              </property-line>`;

    topStats += addProperties(monster.dimmunities, "Damage Immunities", true);
    topStats += addProperties(monster.dresistances, "Damage Resistances", true);
    topStats += addProperties(monster.dvulnerabilities, "Damage Vulnerabilities", true);
    topStats += addProperties(monster.cimmunities, "Condition Immunities", true);
    topStats += addProperties(monster.senses, "Senses", true);
    topStats += addProperties(monster.languages, "Languages", true);
    topStats += addProperties(monster.environments, "Environments", true);
    topStats += addProperties(monster.cr, "Challenge");
    topStats += addProperties(monster.nonEnvironmentCR, "AFH Challenge");
    topStats += `</top-stats>`;
    return topStats;
  }

  function addProperties(property, title, join=false) {
    if(join) {
      if(property.length > 0) {
        return `<property-line>
                  <h4>${title}</h4>
                  <p>${property.join(", ")}</p>
                </property-line>`;
      } else {
        return ``;
      }
    } else {
      return `<property-line>
                <h4>${title}</h4>
                <p>${property} (- XP)</p>
              </property-line>`;
    }
  }

  function getXPFromCR(cr) {

  }

  function getDescriptionNumberValues(field, postfix="") {
    result = ``;
    if(field)
    {
      for(var i = 0; i < field.length; ++i)
      {
        element = field[i];
        console.log(element[1]);
        if(element[0]=="Default") {
          result += element[1]+postfix+", ";
        }
        else if((element[0]=="" && element[1]=="") || i+1==field.length)
        {
          result += element[0]+" "+element[1]+postfix;
        }
        else {
          result += element[0]+" "+element[1]+postfix+", ";
        }
        console.log(result);
      }
    }
    return result;
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
      template += `<property-block>`;
      if(legendaryAction.name)
      {
        template += `<h4>${legendaryAction.name}</h4> `;
      }
      template += `<p>${legendaryAction.description}</p></property-block>`
      returnEmpty=false;
    });
    if(returnEmpty)
    {
      return ``;
    }
    return template;
  }


  function lairActions(monster) {
    var template =  `
            <h3>Lair Actions</h3>
            `;
    var returnEmpty = true;
    monster.lairActions.forEach(function(lairAction) {
      template += `<property-block>`;
      if(lairAction.name)
      {
        template += `<h4>${lairAction.name}</h4> `;
      }
      template += `<p>${lairAction.description}</p>
                   </property-block>`;
      returnEmpty=false;
    });
    if(returnEmpty)
    {
      return ``;
    }
    return template;
  }

  function getDescription(monster) {
    var template =  `
            <h3>Description</h3>
            <p>${monster.description}</p>`;
    return template;
  }

function editMonster(pageFrom) {
  db.findOne( { _id:$("creature-heading").data("id") }, function(error, monster) {
    $(".monsterForm .container").html(createForm(monster));
    $(".monsterForm").data("from", pageFrom);
    $(".page").addClass("hidden");
    $(".monsterForm.page").removeClass("hidden");
  });
}
