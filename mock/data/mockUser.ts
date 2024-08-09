export const mockUser = () =>  { return {
  status: 200,
  token: "",
  role : "Curator",
  id : 'JD10101987',
  orcid : 'JD10101987',
  name : "olivia.rhye",
  username: "Olivia Rhye",
  creation_date : "April 27, 2020",
  email : "oliviarhye@gmail.com"
}
}

export const mockSignup = () =>  { 
  return {
    status: 200,
    user : {
      role : "Curator",
      id : 'JD10101987',
      orcid : 'JD10101987',
      name : "rhye",
      lastName: "Rhye",
      organization : "Organization 1",
      creationDate : "April 27, 2020",
      email : "oliviarhye@gmail.com"
    }
  }
}
