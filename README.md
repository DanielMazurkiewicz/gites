# gites

Command line tool that simplifies workflow with git and packages and configuration files dongling

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