type EventCardProps = {
  title:       String
  description: String
  slug:        String      
  startDate:  Date
  endDate:    Date 
  location:    String
  coverImage:  String
  createdAt:   string 
}

export default function EventCard({title, description, slug, startDate, endDate, location, coverImage, createdAt = "Current Time"}: EventCardProps){
    return (
        <div>

        </div>
    )


}