const program = require('commander');
const package = require('./package');
const simpleGit = require('simple-git')();
 
program
    .version(package.version)
    .option('-n, --new [task_title]', 'Starts a new task')
    .option('-s, --save [comment]', 'Saves current work')
    .option('-w, --switch [task_title]', 'Switches to existing task')
    .option('-f, --from [task_title]', 'Used in conjunction with --new - copies existing task code as base for new task')
    .option('-p, --superpower', 'Allows to save directly to develop or master branch')
    .option('-c, --config [config_name]', 'Switches configuration files (unsupported yet)')
    .parse(process.argv);



const isAwaitingToSave = status => status.not_added.length || status.created.length || status.deleted.length || status.modified.length || status.renamed.length;

simpleGit.fetch();


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
            console.log('Can not switch to other task due to unsaved work - save it first and then switch')
            return;
        }

        let info;
        simpleGit.branch((error, i) => info = i);
        if (!info.branches[program.switch]) {
            console.log('Task doesn\'t exist')
            return;
        }
        

        if (program.switch === true) {
            console.log('Missing task title');
        } else {
            simpleGit.checkout(program.switch);
            simpleGit.pull();
        }
    });
}


if (program.new) {
    simpleGit.status((error, status) => {
        if (status.conflicted.length) {
            console.log('Can not create new task due to existing conflicts: ' + status.conflicted.join(', '))
            return;
        }

        if (isAwaitingToSave(status)) {
            console.log('Can not create new task due to unsaved work - save it first')
            return;
        }

        let info;
        simpleGit.branch((error, i) => info = i);
        if (info.branches[program.new]) {
            console.log('Task already exist, use --switch option if you want to switch to that task')
            return;
        }
        
        const defaultSourceBranch = info.branches.develop ? 'develop' : info.branches.master ? 'master' : false;

        if (!defaultSourceBranch && !program.from) {
            console.log('Missing branch master and/or develop');
            return;
        }

        if (program.from === true) {
            console.log('Missing task title of base code');
            return;
        }

        if (program.new === true) {
            console.log('Missing task title');
        } else {
            simpleGit.checkout(program.from || defaultSourceBranch);
            simpleGit.pull();

            simpleGit.checkout(program.new);
        }
    });
}


if (program.config) {

}
