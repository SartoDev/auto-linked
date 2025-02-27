import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {useState} from "react";
import Markdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"
import remarkGfm from "remark-gfm";
import {useAuth } from '@clerk/clerk-react'

interface Props {
    content: string
}

const formSchema = z.object({
    content: z.string()
})

export function CreatePostDialog(props: Props) {
    const [content, setContent] = useState<string>(props.content);
    const [fileMedia, setFileMedia] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [removeSpace, setRemoveSpace] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { userId } = useAuth();
    const baseUrl = import.meta.env.VITE_API_URL;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: props.content
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "content": content,
        });

        const responseToken = await fetch(`${baseUrl}/access-token?userId=${userId}`, {
            method: "GET"
        })

        if(responseToken.status != 200) {
            setLoading(false);
            toast("User not logged into LinkedIn!")
            return;
        }

        const responseTokenJson = await responseToken.json()

        const data = {
            "accessToken": responseTokenJson["accessToken"],
            "accountId": responseTokenJson["accountId"]
        }

        if(fileMedia) {
            const response = await fetch(`${baseUrl}/initialize-upload?accessToken=${data.accessToken}&accountId=${data.accountId}`, {
                method: "POST"
            })
            const responseJson = await response.json()
            const uploadHeaders = new Headers();
            uploadHeaders.append("upload-url", responseJson["value"]["uploadUrl"]);
            const formData = new FormData();
            formData.append("file", file);
            const uploadOptions = {
                method: "PUT",
                headers: uploadHeaders,
                body: formData
            };
            const responseUpload = await fetch(`${baseUrl}/upload?accessToken=${data.accessToken}`, uploadOptions)
            if(responseUpload.ok) {
                raw = JSON.stringify({
                    content: content,
                    imageId: responseJson["value"]["image"],
                });
            } else {
                setLoading(false)
                return;
            }
        }

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw
        };

        const response = await fetch(`${baseUrl}/post?accessToken=${data.accessToken}&accountId=${data.accountId}`, requestOptions)
        setLoading(false)
        setIsOpen(false)
        if(response.status == 204) {
            toast("Post created successfully!")
        } else {
            toast("Error creating the post!")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileMedia(reader.result as string);
                console.log(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Create Post</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>Create Post</DialogTitle>
                            <DialogDescription>
                                Create a post for Linkedin quickly, without leaving the website.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <Tabs defaultValue="post-content">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="post-content">Post Content</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="post-content">
                                    <Card>
                                        <CardContent className="space-y-2 mt-4">
                                            <div className="space-y-1">
                                                <FormField
                                                    control={form.control}
                                                    name="content"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Content</FormLabel>
                                                            <FormControl>
                                                                <Textarea value={content} onChange={event => setContent(event.target.value)} className="h-[300px]" id="content" placeholder="Content of post" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                                <Label htmlFor="media">Media</Label>
                                                <Input
                                                    id="media"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept=".jpg, .jpeg, .png"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="preview">
                                    <ScrollArea className="h-[400px] rounded-md border p-4">
                                <span className={removeSpace ? "" : "post-content"}>
                                    <Markdown remarkPlugins={[remarkGfm]}>
                                            {content}
                                    </Markdown>
                                </span>
                                        {fileMedia && (
                                            <img src={fileMedia} alt="Uploaded media" className="w-full object-contain" />
                                        )}
                                    </ScrollArea>

                                    <div className="flex items-center mt-3 space-x-2">
                                        <Checkbox checked={removeSpace} onCheckedChange={(checked) => setRemoveSpace(!!checked)} id="remove-space" />
                                        <label
                                            htmlFor="remove-space"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Remove spaces
                                        </label>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <DialogFooter>
                            <Button disabled={loading} type="submit">
                                {loading &&
                                    <Loader2 className="animate-spin" />
                                }
                                Post
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
