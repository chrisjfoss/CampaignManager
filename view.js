let $ = require('jquery'); //jQuery now loaded and assigned to $
let fs = require('fs');
let Datastore = require('nedb')
let filename = 'monsters';
let database = '/data/monsterdatabase'

let count = 0;

var db = new Datastore({filename: database, autoload: true})

$("#add-to-list").on('click', () => {
  let name = $("#Name").val();
  let hp = $("#HP").val();
  var monster = { name: name, hp: hp };
  db.insert(monster, function(err, newMonster) {
    addEntry(newMonster.name, newMonster.hp);
  });
})

$("#click-counter").text(count.toString());
$("#countbtn").on('click', () => {
  ++count;
  $("#click-counter").text(count);
});

function addEntry(name, hp) {
  if(name && hp) {
    let newMonster = '<div class="card"><h5 class="card-header">'+name+'</h5><div class="card-body">'+hp+'</div></div>';
    $("#monsters").append(newMonster);
  }
}

function loadAndDisplayMonsters(name, hp, toFind) {
  db.find({}).exec(function(err,monsters){
    monsters.forEach(function(monster){
      addEntry(monster.name, monster.hp);
    });
  });
}

loadAndDisplayMonsters();
