function monsterHeading(monster) {
    return `
            <creature-heading data-id="${monster.id}">
              <h1 slot='firstHeader'>${monster.name}</h1>
              <h2 slot='secondHeader'>${monster.size} ${monster.type}, ${monster.order} ${monster.morality}</h2>
            </creature-heading>
           `;
  }
function topStats(monster) {
    result = `<top-stats>`;
	result += `<span class='properties'>`
    result += addProperties(monster.ac, "Armor Class");
    result += `
				<property-line>
					<h4>Hit Points</h4>
					<p>${monster.hp} (${monster.hpDicecount}d${monster.hpDice} + ${monster.hpAdd})</p>
				</property-line>
				<property-line>
					<h4>Speed</h4>
					<p>${getDescriptionNumberValues(monster.speeds, "ft.")}</p>
				</property-line>
			  </span>
              <abilities-block>
				<table slot='abilities-block'>
					<tbody><tr>
						<th>STR</th>
						<th>DEX</th>
						<th>CON</th>
						<th>INT</th>
						<th>WIS</th>
						<th>CHA</th>
					</tr>
					<tr>
						<td id="str">${monster.str} (${ getModifierFromStat(monster.str)})</td>
						<td id="dex">${monster.dex} (${ getModifierFromStat(monster.dex)})</td>
						<td id="con">${monster.con} (${ getModifierFromStat(monster.con)})</td>
						<td id="int">${monster.int} (${ getModifierFromStat(monster.int)})</td>
						<td id="wis">${monster.wis} (${ getModifierFromStat(monster.wis)})</td>
						<td id="cha">${monster.cha} (${ getModifierFromStat(monster.cha)})</td>
					</tr>
				</tbody></table>
			  </abilities-block>
			  <span class='properties'>
				<property-line>
					<h4>Saving Throws</h4>
					<p>Str ${monster.strSave}, Dex ${monster.dexSave}, Con ${monster.conSave}, Int ${monster.intSave}, Wis ${monster.wisSave}, Cha ${monster.chaSave}</p>
				</property-line>`;
	result += addProperties(getDescriptionNumberValues(monster.skills), "Skills", false);
    result += addProperties(monster.dimmunities, "Damage Immunities", true);
    result += addProperties(monster.dresistances, "Damage Resistances", true);
    result += addProperties(monster.dvulnerabilities, "Damage Vulnerabilities", true);
    result += addProperties(monster.cimmunities, "Condition Immunities", true);
    result += addProperties(monster.senses, "Senses", true);
    result += addProperties(monster.languages, "Languages", true);
    result += addProperties(monster.environments, "Environments", true);
    result += addProperties(monster.cr, "Challenge");
    result += addProperties(monster.nonEnvironmentCR, "AFH Challenge");
    result += `</span></top-stats>`;
    return result;
  }

  function addProperties(property, title, join=false) {
	if(property) {
		if(join) {
			if(property.length > 0) {
				return `<property-line>
					<h4>${title}</h4>
					<p>${property.join(", ")}</p>
					</property-line>`;
			} else {
				return ``;
			}
		} else if(title.includes("Challenge")) {
			return `<property-line>
				<h4>${title}</h4>
				<p>${property} (${getXPFromCR(property)} XP)</p>
				</property-line>`;
		} else {
			return `<property-line>
				<h4>${title}</h4>
				<p>${property}</p>
				</property-line>`;
		}
	} else {
		return ``;
	}
  }
  
  function getModifierFromStat(stat) {
	  let base = (stat-10)/2.0;
	  return Math.floor(base);
  }

  function getXPFromCR(cr) {
	crValues = [0,200,450,700,1100,1800,2300,2900,3900,5000,5900,7200,8400,10000,11500,13000,15000,18000,20000,22000,25000,33000,41000,50000,62000,75000,90000,105000,120000,135000,155000];
	if(cr === 0) {
		return 10;
	}
	let gradedCalc = (crValues[Math.ceil(cr)] - crValues[Math.floor(cr)]) * (cr - Math.floor(cr));
	return Math.round((gradedCalc + crValues[Math.floor(cr)]));
	
  }

  function getDescriptionNumberValues(field, postfix="") {
    result = ``;
    if(field)
    {
      for(var i = 0; i < field.length; ++i)
      {
		commaValue = ", ";
		if(i + 1 >= field.length) {
			commaValue = "";
		}
        element = field[i];
        
        if(element[0]=="Default") {
          result += element[1]+postfix+commaValue;
        }
        else if((element[0]=="" && element[1]=="") || i+1==field.length)
        {
          result += element[0]+" "+element[1]+postfix;
        }
        else {
          result += element[0]+" "+element[1]+postfix+commaValue;
        }
        console.log(result);
      }
    }
    return result;
  }

  function traits(monster) {
    var template =  `<span class='stat-block'>
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
	template += `</span>`;
    return template;
  }

  function actions(monster) {
    var template =  `<span class='stat-block'>
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
	template += `</span>`;
    return template;
  }

  function legendaryActions(monster) {
    var template =  `<span class='stat-block'>
            <h3>Legendary Actions</h3>
            `;
    var returnEmpty = true;
    monster.legendaryActions.forEach(function(legendaryAction) {
      template += `<property-block>`;
      if(legendaryAction.name)
      {
        template += `<h4>${legendaryAction.name}</h4> `;
		returnEmpty = false;
      }
	  if(legendaryAction.description) { 
		template += `<p>${legendaryAction.description}</p></property-block>`
		returnEmpty=false;
	  }
    });
    if(returnEmpty)
    {
      return ``;
    }
	template += `</span>`;
    return template;
  }


  function lairActions(monster) {
	if(monster && monster.lairActions)
	{
		var template =  `<span class='stat-block'><h3>Lair Actions</h3>`;
		var returnEmpty = true;
		monster.lairActions.forEach(function(lairAction) {
			template += `<property-block>`;
			if(lairAction.name)
			{
				template += `<h4>${lairAction.name}</h4> `;
				returnEmpty=false;
			}
			if(lairAction.description) {
				template += `<p>${lairAction.description}</p>
						</property-block>`;
				returnEmpty=false;
			}
		});
		if(returnEmpty)
		{
			return ``;
		}
		template += `</span>`;
		return template;
	}
  }

  function getDescription(monster) {
	if(!monster.description) {
		return ``;
	}
    var template =  `<span class='stat-block'>
            <h3>Description</h3>
            <p>${monster.description}</p>
			</span>`;
    return template;
  }

function editMonster(pageFrom) {
//  db.findOne( { _id:$("creature-heading").data("id") }, function(error, monster) {
//   $(".monsterForm .container").html(createForm(monster));
//    $(".monsterForm").data("from", pageFrom);
//    $(".page").addClass("hidden");
//    $(".monsterForm.page").removeClass("hidden");
//  });

    db2.search('monsterdatabase', DataPath, 'id', $("creature-heading").data("id"), (succ, monster) => {
	console.log("Success: "+succ);
	if(succ && monster.length >= 1) {
		monster = monster[0];
		$(".monsterForm .container").html(createForm(monster));
		$(".monsterForm").data("from", pageFrom);
		$(".page").addClass("hidden");
		$(".monsterForm.page").removeClass("hidden");
	}
  });
}

function loadMonsterStatBlock(selector) {
  id=$(selector).data("id");
//  db.findOne({ _id:id}, function(err, monster) {
//    $("creature-heading h1").text(monster.name);
//    var html = monsterHeading(monster)+topStats(monster)+traits(monster)+actions(monster)+legendaryActions(monster)+lairActions(monster)+getDescription(monster);
//    $("stat-block").html(html);
//    $(".page").addClass("hidden");
//    $(".monsterstat.page").removeClass("hidden")
//    $(".monsterstat.page").data("from", "home");
//  });
  
  db2.search('monsterdatabase', DataPath, 'id', id, (succ, monster) => {
	console.log("Success: "+succ);
	if(succ && monster.length >= 1) {
		monster = monster[0];
		$("creature-heading h1").text(monster.name);
		var html = monsterHeading(monster)+topStats(monster)+traits(monster)+actions(monster)+legendaryActions(monster)+lairActions(monster)+getDescription(monster);
		$(".page").addClass("hidden");
		$("stat-block").html(html);
		$(".monsterstat.page").removeClass("hidden")
		$(".monsterstat.page").data("from", "home");
	}
  });
}