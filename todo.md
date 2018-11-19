1 exit                      Terminate the daemon
1 load-module               Load a module (args: name, arguments)
2 set-sink-port             Change the port of a sink (args: index|name, port-name)
2 set-source-port           Change the port of a source (args: index|name, port-name)
3 describe-module           Describe a module (arg: name)
3 help                      Show this help
4 set-port-latency-offset   Change the latency of a port (args: card-index|card-name, port-name, latency-offset)
5 suspend                   Suspend all sinks and all sources (args: bool)
5 suspend-sink              Suspend sink (args: index|name, bool)
5 suspend-source            Suspend source (args: index|name, bool)
8 list-samples              List all entries in the sample cache
8 load-sample               Load a sound file into the sample cache (args: name, filename)
8 load-sample-dir-lazy      Lazily load all files in a directory into the sample cache (args: pathname)
8 load-sample-lazy          Lazily load a sound file into the sample cache (args: name, filename)
8 play-file                 Play a sound file (args: filename, sink|index)
8 play-sample               Play a sample from the sample cache (args: name, sink|index)
8 remove-sample             Remove a sample from the sample cache (args: name)
9 dump                      Dump daemon configuration
9 info                      Show comprehensive status
9 set-log-backtrace         Show backtrace in log messages (args: frames)
9 set-log-level             Change the log level (args: numeric level)
9 set-log-meta              Show source code location in log messages (args: bool)
9 set-log-target            Change the log target (args: null|auto|syslog|stderr|file:PATH|newfile:PATH)
9 set-log-time              Show timestamps in log messages (args: bool)
9 stat                      Show memory block statistics
9 update-sink-input-proplist Update the properties of a sink input (args: index, properties)
9 update-sink-proplist      Update the properties of a sink (args: index|name, properties)
9 update-source-output-proplist Update the properties of a source output (args: index, properties)
9 update-source-proplist    Update the properties of a source (args: index|name, properties)
