import { Button } from "@/client/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table";
import { getEmailsAction } from "@/server/controllers/email";
import { unstable_noStore } from "next/cache";
import Link from "next/link";

const Dashboard = async () => {
  unstable_noStore();
  const emails = await getEmailsAction();

  return (
    <div className="border rounded-md" >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Email Address
            </TableHead>
            <TableHead>
              Subject
            </TableHead>
            <TableHead className="text-right" >
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email, index) => (
            <TableRow key={index} >
              <TableCell>
                {email.email}
              </TableCell>
              <TableCell>
                {email.subject}
              </TableCell>
              <TableCell className="text-right" >
                <Button asChild variant="outline" size="sm" >
                  <Link href={`/emails/${email.id}/edit`} >
                    Edit
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
};

export default Dashboard;
