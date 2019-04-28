import os
import sys
import pickle
import face_recognition

# load input data from arguments
friendImage = face_recognition.load_image_file(sys.argv[1])
userPath = sys.argv[2]
friendId = sys.argv[3]

# open existing encodings file or create new encoding dictionary
try: 
    encodings = pickle.load(open(userPath + "/encodings.pickle", "rb"))
except (OSError, IOError) as error:
    encodings = {}

# create new encoding and add to dictionary
friendEncoding = face_recognition.face_encodings(friendImage)
encodings[friendId] = friendEncoding[0]

# write encodings dictionary out to file
outfile = open(userPath + "/encodings.pickle", "wb")
pickle.dump(encodings, outfile)
outfile.close()


### Psuedocode
# Take image on command line (argv 2)
# Encode image with face_recognition
# Save encoding object to variable
# If no file then create new dictionary with encoding
# else open pickle file, add encoding to dictionary
# re-pickle dictionary
# done