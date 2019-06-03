const program = require('commander');
const package = require('./package');
const simpleGit = require('simple-git')();
 
program
    .version(package.version)
    .option('-n, --new [task_title]', 'Starts a new task')
    .option('-s, --save [comment]', 'Saves current work')
    .option('-w, --switch [task_title]', 'Switches to existing task')
    .option('-p, --superpower', 'Allows to save directly to develop or master branch')
    .option('-c, --config [config_name]', 'Switches configuration files (unsupported yet)')
    .parse(process.argv);



const isAwaitingToSave = status => status.not_added.length || status.created.length || status.deleted.length || status.modified.length || status.renamed.length;

simpleGit.fetch((error, info) => console.log(info));



if (program.save) {
    simpleGit.status((error, status) => {
        if (status.conflicted.length) {
            console.log('Can not save due to existing conflicts: ' + status.conflicted.join(', '))
            return;
        }

        if (status.current === 'master' || status.current === 'develop') {
            if (!program.superpower) {
                console.log('Saving to master or develop branch requires -p or --superpower argument')
                return;
            }
        }

        if (isAwaitingToSave(status)) {
            if (program.save === true) {
                console.log('Missing save comment');
            } else {
                simpleGit.add('.');
                simpleGit.commit(program.save);
                simpleGit.push();
            }
        } else {
            console.log('Nothing to save');
        }
    });
}


if (program.switch) {
    simpleGit.status((error, status) => {
        if (status.conflicted.length) {
            console.log('Can not switch to other task due to existing conflicts: ' + status.conflicted.join(', '))
            return;
        }

        if (isAwaitingToSave(status)) {
            console.log('Can not switch to other task due to unsaved work -save it first and then switch')
            return;
        }


        if (program.switch === true) {
            console.log('Missing task title');
        } else {
            simpleGit.add('.');
            simpleGit.commit(program.save);
            simpleGit.push();
        }

    });

}

if (program.new) {

}


if (program.config) {

}