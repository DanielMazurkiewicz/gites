#!/usr/bin/env node

const program = require('commander');
const package = require('./package');
const simpleGit = require('simple-git/promise')();
 
program
    .version(package.version)
    .option('-n, --new [task_title]', 'Starts a new task')
    .option('-s, --save [comment]', 'Saves current work')
    .option('-w, --switch [task_title]', 'Switches to existing task')
    .option('-f, --from [task_title]', 'Optionally used in conjunction with --new - copies existing task code as base for new task')
    .option('-p, --superpower', 'Allows to save directly to develop or master branch')
    .option('-c, --config [config_name]', 'Switches configuration files (unsupported yet)')
    .parse(process.argv);


const isAwaitingToSave = status => status.not_added.length || status.created.length || status.deleted.length || status.modified.length || status.renamed.length;
const getTaskName = taskName => taskName
    .replace(/\*/g, '_')
    .replace(/\?/g, '%')
    .replace(/\^/g, '&')
    .replace(/\~/g, '_')
    .replace(/\:/g, '#')
    .replace(/\\/g, '|')
    .replace(/\s/g, ` `); // magic ;-)


simpleGit.fetch()
.then(() => simpleGit.status())
.then(status => {

    if (program.save) {
        if (status.conflicted.length) {
            throw new Error('Can not save due to existing conflicts: ' + status.conflicted.join(', '))
        }

        if (status.current === 'master' || status.current === 'develop') {
            if (!program.superpower) {
                throw new Error('Saving to master or develop branch requires -p or --superpower argument')
            }
        }

        if (isAwaitingToSave(status)) {
            if (program.save === true) {
                throw new Error('Missing save comment');
            } else {
                return simpleGit.add('.').then(() => 
                    simpleGit.commit(program.save)
                ).then(() =>
                    simpleGit.push()
                )
            }
        } else {
            throw new Error('Nothing to save');
        }
    }
    
    
    if (program.switch) {
        if (status.conflicted.length) {
            throw new Error('Can not switch to other task due to existing conflicts: ' + status.conflicted.join(', '))
        }

        if (isAwaitingToSave(status)) {
            throw new Error('Can not switch to other task due to unsaved work - save it first and then switch')
        }

        return simpleGit.branch().then(info => {
            if (program.switch === true) {
                throw new Error('Missing task title');
            }

            program.switch = getTaskName(program.switch);
            if (!info.branches[program.switch]) {
                throw new Error('Task doesn\'t exist')
            }

            return simpleGit.checkout(program.switch).then(() =>
                simpleGit.pull()
            );
        })
    }
    
    
    if (program.new) {
        if (status.conflicted.length) {
            throw new Error('Can not create new task due to existing conflicts: ' + status.conflicted.join(', '))
        }

        if (isAwaitingToSave(status)) {
            throw new Error('Can not create new task due to unsaved work - save it first')
        }

        return simpleGit.branch().then(info => {

            if (program.new === true) {
                throw new Error('Missing task title');
            }

            if (program.from === true) {
                throw new Error('Missing task title of base code');
            }

            program.new = getTaskName(program.new);
            if (info.branches[program.new]) {
                throw new Error('Task already exist, use --switch option if you want to switch to that task')
            }
            

            const defaultSourceBranch = info.branches.develop ? 'develop' : info.branches.master ? 'master' : false;

            if (!defaultSourceBranch && !program.from) {
                throw new Error('Missing branch master and/or develop');
            }


            program.from = getTaskName(program.from);
            if (program.from !== 'here') {
                return simpleGit.checkout(program.from || defaultSourceBranch).then(() =>
                    simpleGit.pull()
                ).then(() => 
                    simpleGit.checkout(['-b', program.new])
                );
            }

            return simpleGit.checkout(['-b', program.new]);
        });
    }
    
    
    if (program.config) {
        // TODO: support for config
    }

    throw new Error('Invalid commandline options or lack of them')
})
.then(() => {
    console.log('DONE')
})
.catch( error => {
    console.log(error.message);
})


