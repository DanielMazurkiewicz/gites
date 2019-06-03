# gites

Command line tool that simplifies workflow with git. Also helps with dongling packages and configuration files.

# Installation

```
npm install -g gites

or

sudo npm install -g gites
```

# How to use:

```
Usage: gites [options]

Options:
  -V, --version               output the version number
  -n, --new [task_title]      Starts a new task
  -s, --save [comment]        Saves current work
  -w, --switch [task_title]   Switches to existing task
  -f, --from [task_title]     Optionally used in conjunction with --new - copies existing task code as base for new task
  -p, --superpower            Allows to save directly to develop or master branch
  -c, --config [config_name]  Switches configuration files (unsupported yet)
  -h, --help                  output usage information

```

# Usage examples:

```
gites --new "some new task name"
gites --save "comment about what you save or what is a purpouse of it"
gites --switch "some existing task name"
```

# Additional info

Task name "here" is reserved and can be used to inform that new task should be based on current content of local files

```
gites --new "some bugfix task" --from here
```