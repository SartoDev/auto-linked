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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {z} from "zod";

interface Props {
    content: string
}

const formSchema = z.object({
    content: z.string().min(1, {
        message: "Content must be not empty.",
    }),
})

export function DialogDemo(props: Props) {
    const [content, setContent] = useState<string>(props.content);
    const [fileMedia, setFileMedia] = useState<string | null>(null);
    const [removeSpace, setRemoveSpace] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: props.content
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const raw = JSON.stringify({
            "content": values.content,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
        };

        fetch("https://auto-linked-api-azure.vercel.app/", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileMedia(reader.result as string);
                console.log(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Criar post</Button>
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
                                                                <Textarea {...field} className="h-[300px]" onChange={event => setContent(event.target.value)} id="content" placeholder="Content of post" />
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
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="preview">
                                    <ScrollArea className="h-[400px] rounded-md border p-4">
                                <span className={removeSpace ? "" : "post-content"}>
                                    <Markdown>
                                        {content}
                                    </Markdown>
                                </span>
                                        {fileMedia && (
                                            <div className="mt-4">
                                                {fileMedia.startsWith("data:video") ? (
                                                    <video controls className="w-full">
                                                        <source src={fileMedia} type="video/mp4" />
                                                        Seu navegador não suporta vídeos.
                                                    </video>
                                                ) : (
                                                    <img src={fileMedia} alt="Uploaded media" className="w-full object-contain" />
                                                )}
                                            </div>
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
                            <Button type="submit">Post</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
