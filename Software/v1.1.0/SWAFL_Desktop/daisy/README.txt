Daisy 7.1.14 for Windows, built into SWAFL
==========================================
This folder is the Daisy soil-plant-atmosphere model (Daisy 7.1.14 for Windows with Python 3.13), taken
from the installer daisy-7.1.14-Windows-python3.13.exe of the Daisy project (University of Copenhagen,
https://daisy.ku.dk). SWAFL starts bin\daisy-bin.exe itself when you run a Daisy scenario, so Daisy does
not have to be installed. Nothing in it was changed; only parts that Daisy does not use to run a set-up
(the Python package installer pip, the test suites, the graphical Tk toolkit, the sample folder) were left out
to keep the download small. lib\ holds the library files of Daisy (crop.dai and the others).
The licence of Python is in bin\LICENSE.txt. Daisy is free software of the Daisy project; see
https://daisy.ku.dk and the Daisy source repository for its licence and the full documentation.
