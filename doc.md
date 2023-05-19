## Sending invite Email

CommonService branch : `user-contact`
User Service Branch : `user-contacts`


1. [POST] Save Contact : `{{ endpoint }}/userservice/user-contacts`

```
{
	"contacts": [
		{
			"contactEmail": "zzz@aaaa1.com",
			"contactFirstName": "",
			"contactLastName": "",
			"contactLabels": [
				"abcd"
			]
		}
	]
}
```

Response 
```
{
  "data": [
    {
      "contactUserId": null,
      "referredBy": null,
      "contactLabels": [
        "abcd"
      ],
      "isMember": 0,
      "status": 0,
      "isDeleted": 0,
      "_id": "5f941e6e65dc1668d3ef62c6",
      "userId": "5f85a819a0cf6d585ee17888",
      "contactEmail": "zzz@aaaa1.com",
      "contactFirstName": "Alfreda",
      "contactLastName": "Larson",
      "createdAt": "2020-10-24T12:30:38.848Z",
      "updatedAt": "2020-10-24T12:30:38.848Z",
      "__v": 0
    }
  ]
}
```

2. Post invite Signup [POST] `/userservice/user-contacts/post-invite-signup`
```
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZW5kZXJVc2VySWQiOiI1Zjg1YTgxOWEwY2Y2ZDU4NWVlMTc4ODgiLCJjb250YWN0RW1haWwiOiJ6enpAYWFhYS5jb20iLCJjcmVhdGVkQXQiOiIyMDIwLTEwLTI0VDEwOjQ0OjU1LjE5MFoiLCJpYXQiOjE2MDM1MzYyOTUsImV4cCI6MTYwNDE0MTA5NX0.PmHRr2xNS-jEj3eagUub6Cl1A6x3W1fF78N1HLBe1qs"
}
```

```
{
  "message": "Successfully Saved"
}
```

3. Update Contact [PUT] `/userservice/user-contacts/5f92f3cda07fb7962431f2b8`

```
{
	"firstName": "",
	"lastName": "",
	"labels": ["abcd", "health"]
}
```

4. DELETE /userservice/user-contacts/5f92f3cda07fb7962431f2b8

```
{
  "message": "Contact Deleted"
}
```

5. User Contact Lists [get] {{ endpoint }}/userservice/user-contacts/list
```
{
  "data": {
    "totalRecord": 2,
    "data": [
      {
        "_id": "5f9405a7f019a14aa566feb0",
        "contactUserId": "5f5ba6d5d0ec7a22d5a8027f",
        "referredBy": "5f85a819a0cf6d585ee17888",
        "isMember": 1,
        "status": 1,
        "userId": "5f85a819a0cf6d585ee17888",
        "contactEmail": "zzz@aaaa.com",
        "contactFirstName": "Eusebio",
        "contactLastName": "Bruen",
        "createdAt": "2020-10-24T10:44:55.190Z",
        "updatedAt": "2020-10-24T10:48:27.888Z",
        "contact_details": {
          "country": "",
          "images": {
            "name": "31252de9-2e42-447c-8ac2-68b9ad52122a.jpg",
            "path": "uploads/2020/9/"
          },
          "state": ""
        }
      },
      {
        "_id": "5f941e6e65dc1668d3ef62c6",
        "contactUserId": null,
        "referredBy": null,
        "isMember": 0,
        "status": 0,
        "userId": "5f85a819a0cf6d585ee17888",
        "contactEmail": "zzz@aaaa1.com",
        "contactFirstName": "Alfreda",
        "contactLastName": "Larson",
        "createdAt": "2020-10-24T12:30:38.848Z",
        "updatedAt": "2020-10-24T12:30:38.848Z",
        "contact_details": {}
      }
    ]
  }
}

```


## Common service email endpoints 

1. New Contact Invite [POSt] http://localhost:3002/common/mailer/new-contact-invite
```
{
	"senderUserId": "5f5ba6d5d0ec7a22d5a8027f",
	"contactUserId": "5f85a819a0cf6d585ee17888",
	"contactEmail": "someone@localhost.com",
	"tags": ["abc"],
	"inviteToken": "sdjaskdjakjk"
}
```

2. Existing Contact Invite [POST] http://localhost:3002/common/mailer/existing-contact-invite
```
{
	"senderUserId": "5f5ba6d5d0ec7a22d5a8027f",
	"contactUserId": "5f85a819a0cf6d585ee17888",
	"contactEmail": "someone@localhost.com",
	"tags": ["abc"]
}
```


## Corporate service endpoint

1. 





