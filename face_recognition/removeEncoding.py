import os
import sys
import pickle
import face_recognition

# load input data from arguments
userPath = sys.argv[1]
friendId = sys.argv[2]

# open existing encodings file
encodings = pickle.load(open(userPath + "/encodings.pickle", "rb"))

# delete encoding
del encodings[friendId]

# write encodings dictionary out to file
outfile = open(userPath + "/encodings.pickle", "wb")
pickle.dump(encodings, outfile)
outfile.close()