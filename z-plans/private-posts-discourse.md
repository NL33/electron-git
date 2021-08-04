**Allowing Users to Share Files in Private**

# Goal

user can send docs to the site, but make them private, where they are invite only

# Possibilities: Private Messages

Private messages on discourse already have this functionality:
--private
--not indexed by search engines
--allow invite to users 
--still searchable
--can take a private message and convert it to public topic (core functionality allows this just for admins, but probably I can extend to everyone if it's their message)

Would have to add:
--ability to tag.
    --could add tags to private messages, or, to start
    --add custom field with project id
        --and could, potentially, make it so that if convert private message to public topic, it reads the project id, and makes a tag out of that (or adds it to existing tag with it)
--ability to convert private message to public topic for everyone (anyone who created the pm)