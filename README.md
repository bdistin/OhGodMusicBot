# OhGodMusicBot
A v9 Discord.JS music bot in 100 lines or less

##Installation (Windows)

This section is for running the bot locally on Windows. If you're on Mac it should be similar. I'll assume Linux users can figure it out.

###Download Python 2.7.X

Go to the [downloads page](https://www.python.org/downloads/) on python.org and get the latest 2.7.X installer.

###Install Python 2.7.X

Open the installer that you downloaded. Make sure Install for all users is selected, then continue.
Enable all of the options. Most importantly the "Add python.exe to Path" one:
![](http://puu.sh/r8IGz/da533fd0b7.png)

Enable "Add python.exe to Path"
Then install it and close the installer

###Download Visual Studio

Next we need to download Visual Studio because it has a C++ compiler.
Go to the [Microsoft Visual Studio website](https://www.visualstudio.com/en-us/visual-studio-homepage-vs.aspx) and click Download Community 2015.

###Install Visual Studio

Open vs_community_ENU.exe
Check only the Common Tools for Visual C++ 2015 box like so:
![](http://puu.sh/r8ISY/7ef354ac53.png)

Now install. This will take a long time.

###Download Node.js

Node.js is what will be used to run the bot.
Download [Node.js 6.X from the website](https://nodejs.org/en/).

###Install Node.js

Open the Node.js Setup.
In the options, make sure `Node.js runtime` `npm package manager` and `Add to PATH` are enabled. After that install Node.js.

###Download Git

And install it. The website is http://git-scm.com and make sure you choose "for command prompt".

###Download FFMPEG

Download FFMPEG from [this website](https://ffmpeg.zeranoe.com/builds/). Make sure to find the current **Static Build** for your OS Architecture (32bit/64bit).

###Install & Configure FFMPEG

Extract the files to the root of your harddrive, and rename the folder to `ffmpeg`. 

**Then add FFMPEG to your Path variable: **

1. `windows key + x`
2. go to system
3. on the left Advanced system settings
4. Environment Variables
5. under System variables find the variable **Path** hit edit
  * Depending on your version of windows you may have a list of entries or a semicolon sperated field of entries. 

**If Windows 10:**

1. Hit the new button on the right
2. add `c:\ffmpeg\bin`

**If older versions of Windows:**

1. add `;c:\ffmpeg\bin` to the end of the field.

###Download and Install OhGodMusicBot

Next you'll need to download the bot and configure it.
Download the master branch and put the unzipped files in a new folder on your computer.
Next rename .json.example to .json and enter the correct information.

Before running the bot you need to install the dependencies.
In the folder you put the files in, Shift+Right click and select open command window here.
In the command prompt type `npm install`.

The bot should now be ready!
Open a command prompt like above and type npm start to start the bot and see if it works.

###Install dependencies

**Windows**

Shift-RightClick in the folder that you downloaded and select Open command window here. Then type npm install and hit Enter.

**Linux**

cd to where you cloned the GitHub repo and type npm install. This will take a while.
